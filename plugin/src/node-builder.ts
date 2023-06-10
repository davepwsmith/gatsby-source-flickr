import {
  Photo,
  Geo,
  ThumbnailLabels,
  ImageLabels,
  FlickrPhotoLicense,
  FlickrPeopleGetPublicPhotosResponse,
  OrigLabels,
  FlickrPhotosLicensesGetInfoResponse,
  ImageOrThumb,
  FlickrImage,
  FlickrThumbnail,
  FlickrPermissions,
} from "./types";
import { sizes } from "./constants";

const { THUMBS, CROPS, ORIG } = sizes;

/**
 * Flickr's API responses are not very well structured - i.e. they are very flat with related items
 * left ungrouped. This function groups them
 * @param flickrPhoto A single item from the flickr public photos response
 * @param size A specific size to group for (e.g. 'o')
 * @returns An object containg url, height, width, orientation and label for a single photo size
 */
const getSizeDetails = <T extends ThumbnailLabels | ImageLabels | OrigLabels>(
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse,
  size: T
): ImageOrThumb<T> => {
  const widthKey = `width_${size}`;
  const heightKey = `height_${size}`;
  const urlKey = `url_${size}`;

  const width = Number(flickrPhoto[widthKey]);
  const height = Number(flickrPhoto[heightKey]);
  const url: string = flickrPhoto[urlKey];

  if (width && height && url) {
    const orientation =
      width === height ? "square" : width > height ? "landscape" : "portrait";

    const sizeDetails = {
      src: url,
      width: width,
      height: height,
      label: size,
      orientation: orientation,
    } as ImageOrThumb<T>;

    return sizeDetails;
  } else {
    return null;
  }
};

/**
 * Get all the thumbnail sized images from a flickr API response
 * @param flickrPhoto A single flickr photo
 * @returns A list of thumbnail objects
 */
const getThumbnails = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse
): FlickrThumbnail[] =>
  THUMBS.map((x) => getSizeDetails(flickrPhoto, x)).filter((x) => x !== null);

/**
 * Get all the normal sized images from a flickr API response
 * @param flickrPhoto A single flickr photo
 * @returns A list of image objects
 */
const getImages = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse
): FlickrImage[] =>
  [...CROPS, ...ORIG]
    .map((x) => getSizeDetails(flickrPhoto, x))
    .filter((x) => x !== null);

/**
 * Structures the geotagging information returned by the flickr API
 * @param flickrPhoto A single flickr photo
 * @returns A structured set of geotagging information for a photo
 */
const getGeoDetails = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse
): Geo => {
  const geospatial = [
    "longitude",
    "latitude",
    "accuracy",
    "context",
    "place_id",
    "woeid",
  ];

  let geo: Geo;
  const permissions: FlickrPermissions = fixPermissions(flickrPhoto, "geo");

  for (const property in flickrPhoto) {
    if (geospatial.includes(property)) {
      if (property === "place_id" || property === "woe_id") {
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

  const geoData: Geo = {
    ...geo,
    permissions: permissions,
  };

  return geoData;
};

/**
 * Determine the license type from the reported ID
 * @param id The ID number of a license type returned on a flickr photo object
 * @param licenses An array of all the license types
 * @returns A single license object
 */
const getLicense = (
  id: string | number | undefined,
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

/**
 * Parse Flickr dates to Javascript Date
 * @param date A date, as a unix timestamp
 * @returns A date as a javascript Date object
 */
const fixDate = (date: string | number) =>
  Number(date)
    ? new Date(Number(date) * 1000)
    : !isNaN(new Date(date).getTime())
    ? new Date(date)
    : undefined;

const fixPermissions = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse,
  prefix?: string
) => {
  let permissions: FlickrPermissions;
  const permissionKeys = ["ispublic", "isfriend", "isfamily", "iscontact"];

  for (const property in flickrPhoto) {
    if (prefix) {
      const cleanKey = property.replace(prefix, "").replace(/_/g, "");
      if (property.startsWith(prefix) && permissionKeys.includes(cleanKey)) {
        const key = cleanKey.replace("is", "");
        permissions = {
          ...permissions,
          [key]: Boolean(Number(flickrPhoto[property])),
        };
      }
    } else {
      if (permissionKeys.includes(property)) {
        const cleanKey = property;
        const key = cleanKey.replace("is", "");
        permissions = {
          ...permissions,
          [key]: Boolean(Number(flickrPhoto[property])),
        };
      }
    }
  }

  return permissions;
};

export const buildFlickrPhotoNode = (
  flickrPhoto: FlickrPeopleGetPublicPhotosResponse,
  licenses?: FlickrPhotosLicensesGetInfoResponse["licenses"]["license"]
): Photo => {
  try {
    const photo: Photo = {
      _id: flickrPhoto.id,
      owner: flickrPhoto.owner,
      ownerName: flickrPhoto?.ownername,
      title: flickrPhoto.title,
      license: licenses
        ? getLicense(flickrPhoto?.license, licenses)
        : undefined,
      permissions: fixPermissions(flickrPhoto),
      description: flickrPhoto?.description?._content,
      dateUploaded: fixDate(flickrPhoto?.dateupload),
      dateLastUpdated: fixDate(flickrPhoto?.lastupdate),
      dateTaken: fixDate(flickrPhoto?.datetaken),
      views: flickrPhoto?.views ? Number(flickrPhoto?.views) : undefined,
      tags: flickrPhoto?.tags ? flickrPhoto.tags.split(" ") : undefined,
      machineTags: flickrPhoto?.machine_tags
        ? flickrPhoto.machine_tags.split(" ")
        : undefined,
      geoData: getGeoDetails(flickrPhoto),
      media: flickrPhoto?.media,
      pathAlias: flickrPhoto?.pathalias,
      images: getImages(flickrPhoto),
      thumbnails: getThumbnails(flickrPhoto),
    };
    if (photo._id && photo.owner && photo.title) {
      return photo;
    } else {
      throw Error("Bad photo data input");
    }
  } catch (error) {
    return error;
  }
};
