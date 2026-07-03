import { ReactComponent as ImdbLogo } from "./assets/imdbLogo.svg";
import { ReactComponent as RotenLogo } from "./assets/rotenLogo.svg";
import { ReactComponent as MetacriticLogo } from "./assets/metacriticLogo.svg";

export function CriticRatings({
  imdbRating,
  rottenTomatoesRating,
  metacriticRating,
}) {
  return (
    <p>
      <ImdbLogo width="3vw" />
      {imdbRating}
      <RotenLogo width="2vw" />
      {rottenTomatoesRating || "N/A"}
      <MetacriticLogo width="2vw" />
      {metacriticRating?.split("/")[0] || "N/A"}%
    </p>
  );
}
