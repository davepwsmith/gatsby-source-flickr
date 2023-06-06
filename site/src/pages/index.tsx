import * as React from "react";
import { graphql, PageProps } from "gatsby";
import { GatsbyImage, getImage } from "gatsby-plugin-image";

export default function IndexPage({data}: PageProps<Queries.IndexPageQuery>): React.ReactElement {
  const {squarePhoto, naturalPhoto, fullWidthPhoto, fixedWidthPhoto} = data
  const photos = [squarePhoto, naturalPhoto, fullWidthPhoto, fixedWidthPhoto]
  return (
    <main>
      <h1>All posts</h1>
      {photos.map((photo) => {
        const image = getImage(photo);
        return (
          <div key={photo.id}>
            <h2>{photo._id}</h2>
            <GatsbyImage alt="" image={image} />
          </div>
        );
      })}
    </main>
  );
}

export const query = graphql`
  query IndexPage {
    squarePhoto: flickrPhoto {
        id
        _id
        gatsbyImageData(
          width: 300,
          height: 300
        )
      
    }
    naturalPhoto: flickrPhoto {
        id
        _id
        gatsbyImageData
      
    }
    fullWidthPhoto: flickrPhoto {
        id
        _id
        gatsbyImageData(
          layout: FULL_WIDTH
        )
      
    }
    fixedWidthPhoto: flickrPhoto {
        id
        _id
        gatsbyImageData(
          layout: FIXED,
          width: 300,
          height: 300
        )
      
    }
  }
`;
