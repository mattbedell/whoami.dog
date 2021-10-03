const fetch = require("node-fetch");
const jsdom = require("jsdom");
require("dotenv").config();
const { MongoClient } = require("mongodb");

const { JSDOM } = jsdom;

const articleExpr = /\/wiki\/(.*)/;

const apiQuery =
  "https://en.wikipedia.org/w/api.php?action=parse&prop=text&formatversion=2&format=json&page";

const dbClient = new MongoClient(process.env.MONGO_URL);
dbClient.connect();
const db = dbClient.db(process.env.MONGO_DB);

const replaceCitationAnnotation = (string) => string.replace(/\[(\d|\w)+\]/g, '');

async function main() {
  const dogListResponse = await fetch(`${apiQuery}=List_of_dog_breeds`);
  const {
    parse: { text: dogListData },
  } = await dogListResponse.json();
  const {
    window: { document: dogListDoc },
  } = new JSDOM(dogListData);

   return Array.from(
    dogListDoc.querySelectorAll(".div-col ul li a[title]")
  ).reduce(
    (allReqs, element) =>
      allReqs.then(async (allDogs) => {
        const { href, title } = element;
        console.log(title);

        const articleBasename = articleExpr.exec(href)[1];
        const json = await fetch(`${apiQuery}=${articleBasename}`)
          .then((res) => res.json())
          .catch(() => {
            console.error(href, title, articleBasename);
          });

        if (!json?.parse) {
          console.error(href, title);
          return allDogs;
        }

        const {
        parse: { text: dogArticle, pageid: _id },
        } = json;
        const {
          window: { document: doc },
        } = new JSDOM(dogArticle);

        const summary = doc.querySelector("p:not([class])").textContent.replace(/\n$/, "");
        const imgSrc = doc.querySelector(".infobox-image a img")?.src;

        const infoboxes = doc.querySelectorAll(
          ".infobox-full-data table tbody"
        );

        const traitsbox = Array.from(infoboxes).filter(
          (box) =>
            box.querySelector("tr th").textContent?.trim().toLowerCase() ===
            "traits"
        )[0];

        let traits = [];

        if (traitsbox) {
          const traitEntries = Array.from(
            traitsbox.querySelectorAll("tr")
          ).slice(1);

          traits = traitEntries
            .filter((trait) => !!trait.querySelector("th").textContent)
            .map((trait) => {
              const key = trait.querySelector("th").textContent;
              const value = trait
                .querySelector("td:last-of-type")
                .textContent.replace(/^\n/, "");

              return { key, value };
            });
        }

        const entry = {
          href: `https://en.wikipedia.com${href}`,
          title,
          summary: replaceCitationAnnotation(summary),
          traits: traits.map(({ value, ...trait}) => ({ ...trait, value: replaceCitationAnnotation(value) })),
          imgSrc,
        };

        await db.collection('breeds').updateOne({ _id }, { $setOnInsert: entry }, { upsert: true })

        // slow it down so we don't get rate limited
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(allDogs);
          }, 2000);
        });
      }),
    Promise.resolve([])
  ).catch((e) => console.error(e));
}

main();
