import {
  Photo,
  Geo,
  GeoPermissions,
  ThumbnailLabels,
  ImageLabels,
  FlickrPhotoLicense,
  FlickrPeopleGetPublicPhotosResponse,
  OrigLabels,
  ThumbnailUrls,
  ImageUrls,
  FlickrPhotosLicensesGetInfoResponse,
} from "./types";
import { sizes } from "./constants";

const { THUMBS, CROPS, ORIG } = sizes;

const getSizeDetails = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse,
  size: ThumbnailLabels | ImageLabels | OrigLabels
) => {
  let sizeDetails;

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

const getThumbnailUrls = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse
): ThumbnailUrls =>
  THUMBS.map((x) => getSizeDetails(flickrPhoto, x)).filter((x) => x !== null);
const getImageUrls = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse
): ImageUrls =>
  [...CROPS, ...ORIG]
    .map((x) => getSizeDetails(flickrPhoto, x))
    .filter((x) => x !== null);

const getGeoDetails = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse
): Geo => {
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
  let permissions: GeoPermissions;

  for (const property in flickrPhoto) {
    if (geospatial.includes(property)) {
      if (property.startsWith("geo_")) {
        switch (property) {
          case "geo_is_public":
            permissions = {
              ...permissions,
              is_public: flickrPhoto[property],
            };
            break;
          case "geo_is_family":
            permissions = {
              ...permissions,
              is_family: flickrPhoto[property],
            };
            break;
          case "geo_is_friend":
            permissions = {
              ...permissions,
              is_friend: flickrPhoto[property],
            };
            break;
          case "geo_is_contact":
            permissions = {
              ...permissions,
              is_contact: flickrPhoto[property],
            };
            break;
        }
      } else if (property === "place_id" || property === "woe_id") {
        geo = {
          ...geo,
          [property]: flickrPhoto[property].toString(),
        };
      } else {
        geo = {
          ...geo,
          [property]: parseFloat(flickrPhoto[property])
            ? parseFloat(flickrPhoto[property])
            : flickrPhoto[property],
        };
      }
    }
  }

  return geo;
};

const getLicense = (
  id: number,
  licenses: FlickrPhotosLicensesGetInfoResponse["licenses"]["license"]
): FlickrPhotoLicense => {
  const _id = Number(id);

  if (!isNaN(_id)) {
    const { id, name, url } = licenses.find((x) => x.id === _id);

    return {
      _id: id,
      name: name,
      url: url,
    };
  } else {
    return undefined;
  }
};

const fixDate = (date) => (date ? new Date(date * 1000) : undefined);

export const buildFlickrPhotoNode = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse,
  licenses: FlickrPhotosLicensesGetInfoResponse["licenses"]["license"]
): Photo => {
  const photo: Photo = {
    _id: flickrPhoto.id,
    owner: flickrPhoto.owner,
    ownerName: flickrPhoto?.ownername,
    title: flickrPhoto.title,
    license: getLicense(flickrPhoto?.license, licenses),
    description: flickrPhoto?.description?._content,
    dateUploaded: fixDate(flickrPhoto?.dateupload),
    dateLastUpdated: fixDate(flickrPhoto?.lastupdate),
    dateTaken: flickrPhoto?.datetaken,
    views: flickrPhoto?.views,
    tags: flickrPhoto?.tags ? flickrPhoto.tags.split(" ") : undefined,
    machineTags: flickrPhoto?.machine_tags
      ? flickrPhoto.machine_tags.split(" ")
      : undefined,
    geoData: getGeoDetails(flickrPhoto),
    media: flickrPhoto?.media,
    pathAlias: flickrPhoto?.pathalias,
    imageUrls: getImageUrls(flickrPhoto),
    thumbnailUrls: getThumbnailUrls(flickrPhoto),
  };

  return photo;
};
