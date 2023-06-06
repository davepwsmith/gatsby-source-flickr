import { IGatsbyImageData } from "gatsby-plugin-image";
import { getGatsbyImageResolver } from "gatsby-plugin-image/graphql-utils";

import type { ImageUrls, Photo } from "./types";
import { IResponsiveImageProps } from "gatsby-plugin-image/dist/src/components/picture";
import { GatsbyNode } from "gatsby";

// TODO: Work out whether this could be done 'properly' using the generateImageData etc. bits.
// This would mean that we could theoretically pass intrinsic and stipulated sizes, allow for ratios, etc. 

interface IImageFilter {
  images: ImageUrls;
  src: string;
  maxWidth: number;
  maxHeight: number;
}

/**
 * A function to remove any images which are larger than required, and return default values 
 * for the image `src` and max width/height
 * @param imageUrls A list of imageUrl objects retrieved from a flickrPhoto
 * @param width the width required, if specified
 * @param height the height required, if specified
 * @returns An object with a filtered list of images, max height and width, and fallback url
 */
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

  // Sort photos into size order
  imageUrls.sort((a, b) => a.width - b.width);

  //Get index of smallest image which satisfies both height and width image
  const widest = imageUrls.findIndex(x => x.width === maxWidth)
  const tallest = imageUrls.findIndex(x => x.height === maxHeight)
  const idx = Math.max(widest, tallest)

  // Filter images to only include images below the largest size requested in the srcset
  const filteredImages = imageUrls.slice(0,(idx+1))
  
  // Return largest image in set for fallback
  const largestImage = filteredImages[idx];

  return {
    images: filteredImages,
    src: largestImage?.url,
    maxWidth: largestImage?.width,
    maxHeight: largestImage?.height,
  };
};

/**
 * A function that returns srcSet and sizes parameters for use in responsive images
 * @param images A list of images as @type ImageUrl objects
 * @param maxWidth The maximum width of image to display
 * @returns an obect containing srcSet and sizes strings
 */
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


/**
 * A function to generate dataUrl thumbnails for flickr images
 * @param thumbs A list of thumbnails as ImageUrl objects
 * @returns A base64 encoded dataUrl of the smallest possible thumbnail
 *          for blur-ups
 */
const getThumbnail = async (thumbs: ImageUrls) => {
  // Generate a base64 thumbnail from the smallest image available
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


/**
 * A function to resolve flickr images into gatsbyImageData-shaped objects
 * @param image an image node passed by gatsbyjs
 * @param options additional options passed by the user
 * @returns image data to be returned in graphql and consumed by GatsbyImage elements
*/
// TODO: It doesn't seem right that we are taking in IGatsbyImageData and returning the same...
const resolveGatsbyImageData = async (
  image: Photo,
  options: IGatsbyImageData
): Promise<IGatsbyImageData> => {
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
    width: width ? width : maxWidth,
    height: height ? height : maxHeight,
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
