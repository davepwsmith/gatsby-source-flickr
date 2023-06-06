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
