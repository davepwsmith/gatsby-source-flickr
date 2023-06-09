export const PHOTO_NODE_TYPE = `FlickrPhoto` as const;

export const sizes = {
  THUMBS: ["sq", "q", "t"],
  CROPS: ["s", "n", "m", "z", "c", "l", "h", "k"],
  ORIG: ["o"],
} as const;

export const extras = {
  description: "description",
  license: "license",
  dateUploaded: "date_upload",
  dateTaken: "date_taken",
  ownerName: "owner_name",
  iconServer: "icon_server",
  originalFormat: "original_format",
  dateLastUpdated: "last_update",
  geoData: "geo",
  tags: "tags",
  machineTags: "machine_tags",
  originalDimensions: "o_dims",
  views: "views",
  media: "media",
  pathAlias: "path_alias",
} as const;

export const FLICKR_ERROR_CODES = {
  USERNAME_NOT_FOUND: "1",
  NO_USERNAME_SPECIFIED: "2",
  INVALID_API_KEY: "100",
  SERVICE_CURRENTLY_UNAVAILABLE: "105",
  WRITE_OPERATION_FAILED: "106",
  REPONSE_FORMAT_NOT_FOUND: "111",
  METHOD_NOT_FOUND: "112",
  INVALID_SOAP_ENVELOPE: "114",
  INVALID_RPC_: "115",
  BAD_URL: "116",
} as const;
