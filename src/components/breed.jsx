import React, { useState } from "react";

import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Skeleton,
  IconButton,
  Collapse,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Link,
  styled,
} from "@mui/material";

import {
  ExpandMore as ExpandMoreIcon,
  OpenInNewRounded,
} from "@mui/icons-material";

import api from "../state/api.js";

const ExpandMore = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  marginLeft: "auto",
  transition: theme.transitions.create("transform", {
    duration: theme.transitions.duration.shortest,
  }),
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  "&:last-child td, &:last-child th": {
    border: 0,
  },
}));

export const BreedCard = ({ breedId, children }) => {
  const [expanded, setExpanded] = useState(false);
  const { isFetching, data: breed } = api.endpoints.getBreed.useQuery(breedId);
  return (
    <Card sx={{ display: "flex", flexDirection: "column" }}>
      {isFetching ? (
        <Skeleton variant="rectangular" height="200px" />
      ) : (
        <CardMedia
          component="img"
          image={breed?.imgSrc}
          height="200"
          sx={{ objectPosition: "top" }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {isFetching ? (
            <Skeleton />
          ) : (
            <div style={{display: "flex" }}>
              <Link
                underline="hover"
                color="inherit"
                href={breed.href}
                target="_blank"
                rel="noopener"
              >
                {breed.title}
                <OpenInNewRounded
                  color="disabled"
                  sx={{ width: ".5em", heigh: ".5em" }}
                />
              </Link>
              <ExpandMore
                expand={expanded}
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                arial-label="show more"
              >
                <ExpandMoreIcon />
              </ExpandMore>
            </div>
          )}
        </Typography>
      </CardContent>

      <Collapse in={expanded} timeout="auto">
        <CardContent sx={{ paddingTop: "0" }}>{breed?.summary}</CardContent>
        {breed?.traits?.length > 0 && (
          <TableContainer component={Paper}>
            <Table size="small" aria-label="breed traits table">
              <TableBody>
                {breed?.traits.map(({ key, value }) => (
                  <StyledTableRow>
                    <TableCell component="th" scope="row">
                      {key}
                    </TableCell>
                    <TableCell align="right">{value}</TableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Collapse>
      {!isFetching && children}
    </Card>
  );
};
