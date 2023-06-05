import { FlickrPhoto, Photo, ImageUrl, Geo } from "./types";
import { THUMBS, SIZES } from "./constants";

const getSizeDetails = (flickrPhoto: FlickrPhoto, size: string): ImageUrl => {
  let sizeDetails: ImageUrl;
  for (const property in flickrPhoto) {
    const lastElem = property.toString().split("_").pop();
    const firstElem = property.toString().split("_").shift();

    if (firstElem && lastElem && lastElem == size) {
      // Some fields can come down as either string or number.
      //GraphQL doesn't like that. Force width/height to number.
      sizeDetails = {
        ...sizeDetails,
        [firstElem]: parseFloat(flickrPhoto[property])
          ? parseFloat(flickrPhoto[property])
          : flickrPhoto[property],
      };
    }
  }

  if (sizeDetails) {
    sizeDetails.label = size;
    sizeDetails.orientation =
      sizeDetails.width === sizeDetails.height
        ? "square"
        : sizeDetails.width > sizeDetails.height
        ? "landscape"
        : "portrait";

    return sizeDetails;
  } else {
    return null;
  }
};

const getGeoDetails = (flickrPhoto: FlickrPhoto): Geo => {
  const geospatial = [
    "longitude",
    "latitude",
    "geo_is_public",
    "geo_is_family",
    "geo_is_friend",
    "geo_is_contact",
    "accuracy",
    "context",
    "place_id",
    "woeid",
  ];

  let geo: Geo;

  for (const property in flickrPhoto) {
    const firstElem = property.toString().split("_").shift();

    if (geospatial.includes(property)) {
      if (firstElem && firstElem === "geo") {
        geo.permissions[property.toString().substring(4)] =
          flickrPhoto[property];
      } else {
        geo[property] = parseFloat(flickrPhoto[property])
          ? parseFloat(flickrPhoto[property])
          : flickrPhoto[property];
      }
    }
  }

  return geo;
};

export const fixPhoto = (flickrPhoto: FlickrPhoto): Photo => {
  const photo: Photo = {
    _id: flickrPhoto.id,
    owner: flickrPhoto.owner,
    ownername: flickrPhoto?.ownername,
    title: flickrPhoto.title,
    license: flickrPhoto?.license,
    description: flickrPhoto?.description?._content,
    upload_date: flickrPhoto.dateupload
      ? new Date(flickrPhoto.dateupload * 1000)
      : undefined,
    lastupdate_date: flickrPhoto.lastupdate
      ? new Date(flickrPhoto.lastupdate * 1000)
      : undefined,
    datetaken: flickrPhoto?.datetaken,
    views: flickrPhoto?.views,
    tags: flickrPhoto?.tags,
    machine_tags: flickrPhoto.machine_tags,
    geo: getGeoDetails(flickrPhoto),
    media: flickrPhoto?.media,
    media_status: flickrPhoto?.media_status,
    imageUrls: SIZES.map((x) => getSizeDetails(flickrPhoto, x)).filter(
      (x) => x !== null
    ),
    thumbnailUrls: THUMBS.map((x) => getSizeDetails(flickrPhoto, x)).filter(
      (x) => x !== null
    ),
  };

  return photo;
};
