import { IGatsbyImageData, IGetImageDataArgs } from "gatsby-plugin-image";
import { getGatsbyImageResolver } from "gatsby-plugin-image/graphql-utils";

import type { ImageUrls, Photo } from "./types";
import { IResponsiveImageProps } from "gatsby-plugin-image/dist/src/components/picture";
import { GatsbyNode } from "gatsby";

interface IImageFilter {
  images: ImageUrls;
  src: string;
  maxWidth: number;
  maxHeight: number;
}

const filterImages = (
  imageUrls: ImageUrls,
  width?: number,
  height?: number
): IImageFilter => {
  // List widths and heights of all photos
  const widths = imageUrls.map((x) => x.width);
  const heights = imageUrls.map((x) => x.height);

  // Get longest and tallest photo (because flickr measures along the long edge of a photo, the
  // sizes listed on the API can't be relied upon)
  const maxWidth = width
    ? Math.min(...widths.filter((num) => num >= width))
    : Math.max(...widths);
  const maxHeight = height
    ? Math.min(...heights.filter((num) => num >= height))
    : Math.max(...heights);

  // Filter images to only include images below the largest size requested in the srcset
  const filteredImages = imageUrls.filter(
    (x) => x.height <= maxHeight && x.width <= maxWidth
  );
  filteredImages.sort((a, b) => a.width - b.width);
  const largestImage = filteredImages[filteredImages.length - 1];

  return {
    images: filteredImages,
    src: largestImage?.url,
    maxWidth: largestImage?.width,
    maxHeight: largestImage?.height,
  };
};

const generateSrcSets = (images, maxWidth): IResponsiveImageProps => {
  // Generate appropriate srcSet and sizes properties for the max width specified
  const srcSet = images.map((x) => `${x.url} ${x.width}w`).join();
  const maxWidthSettings = images
    .map((x) => `(max-width: ${Math.ceil(x.width / 100) * 100}px) ${x.width}px`)
    .join();
  const sizes = `${maxWidthSettings}, ${maxWidth}px`;

  const image = {
    srcSet: srcSet,
    sizes: sizes,
  };

  return image;
};

const getThumbnail = async (thumbs: ImageUrls) => {
  // Generate a base64 thumbnail from the smallest
  const thumb = thumbs.find((x) => x.label == "t");
  if (thumb && thumb.url) {
    const { url } = thumb;
    const res = await fetch(url);
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const contentType = res.headers.get("content-type");

    return `data:${contentType};base64,${base64}`;
  } else {
    return null;
  }
};

const resolveGatsbyImageData = async (
  image: Photo,
  options: IGetImageDataArgs
) => {
  // The `image` argument is the node to which you are attaching the resolver,
  // so the values will depend on your data type.
  const { width, height, layout } = options;
  const { imageUrls, thumbnailUrls } = image;

  const { images, src, maxWidth, maxHeight } = filterImages(
    imageUrls,
    width,
    height
  );

  const sources = generateSrcSets(images, maxWidth);

  const thumb = await getThumbnail(thumbnailUrls);

  const placeholder = thumb ? { fallback: thumb } : undefined;

  const imageData: IGatsbyImageData = {
    layout: layout ? layout : "constrained",
    width: maxWidth,
    height: maxHeight,
    placeholder: placeholder,
    images: {
      sources: [
        {
          ...sources,
          type: "jpg",
        },
      ],
      fallback: {
        src: src,
        ...sources,
      },
    },
  };

  return imageData;
};

export const createResolvers: GatsbyNode["createResolvers"] = ({
  createResolvers,
}) => {
  createResolvers({
    FlickrPhoto: {
      gatsbyImageData: getGatsbyImageResolver(resolveGatsbyImageData),
    },
  });
};
