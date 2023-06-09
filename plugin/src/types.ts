import type {
  PluginOptions as GatsbyDefaultPluginOptions,
  IPluginRefOptions,
} from "gatsby";

import { sizes, extras } from "./constants";
import { IImage } from "gatsby-plugin-image";

// These types were invented based on a sample of responses from the 
// Flickr API - they may or may not actually be accurate...

export type FlickrPhotosLicensesGetInfoResponse = {
  licenses: {
    license: {
      id: number;
      name: string;
      url: string;
    }[];
  };
  stat: string;
};

export type FlickrPeopleGetPublicPhotosResponse = {
  id: string;
  owner: string;
  secret: string;
  server: string;
  farm: number | string;
  title: string;
  ispublic: number;
  isfriend: number;
  isfamily: number;
  license?: number;
  description?: Description;
  dateupload?: number;
  lastupdate?: number;
  datetaken?: string;
  datetakengranularity?: number;
  datetakenunknown?: number;
  ownername?: string;
  iconserver?: string;
  iconfarm?: number;
  views?: number;
  tags?: string;
  machine_tags?: string;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  context?: number;
  media?: string;
  media_status?: string;
  url_sq?: string;
  height_sq?: number;
  width_sq?: number;
  url_t?: string;
  height_t?: number;
  width_t?: number;
  url_s?: string;
  height_s?: string;
  width_s?: string;
  url_q?: string;
  height_q?: string;
  width_q?: string;
  url_m?: string;
  height_m?: string;
  width_m?: string;
  url_n?: string;
  height_n?: string;
  width_n?: string;
  url_z?: string;
  height_z?: string;
  width_z?: string;
  url_c?: string;
  height_c?: string;
  width_c?: string;
  url_l?: string;
  height_l?: string;
  width_l?: string;
  url_h?: string;
  height_h?: string;
  width_h?: string;
  url_k?: string;
  height_k?: string;
  width_k?: string;
  pathalias?: string;
  woeid?: number | string;
  placeid?: string;
};

// Types in use in my code. 

export type FlickrPhotoLicense = {
  _id: number;
  name: string;
  url: string;
};

type Description = {
  _content: string;
};

type Orientation = {
  orientation: "landscape" | "portrait" | "square";
};

export type ThumbnailLabels = (typeof sizes.THUMBS)[number];
export type ImageLabels = (typeof sizes.CROPS)[number];
export type OrigLabels = (typeof sizes.ORIG)[number];

export type FlickrImage = IImage &
  Orientation & {
    label: ImageLabels | OrigLabels;
  };

export type FlickrThumbnail = IImage &
  Orientation & {
    label: ThumbnailLabels;
  };

// This utitlity type is needed for functions that can return either an image URL or a thumbnail URL
export type ImageOrThumb<T extends ThumbnailLabels | ImageLabels | OrigLabels> =
  T extends ThumbnailLabels ? FlickrThumbnail : FlickrImage;

export type GeoPermissions = {
  is_public?: number;
  is_friend?: number;
  is_family?: number;
  is_contact?: number;
};

export type Geo = {
  permissions?: GeoPermissions;
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  context?: number;
  woeid?: string;
  placeid?: string;
};

export type Photo = {
  _id: string;
  owner: string;
  ownerName?: string;
  title: string;
  license?: FlickrPhotoLicense;
  description?: string;
  dateUploaded?: Date;
  dateLastUpdated?: Date;
  dateTaken?: string;
  views?: number;
  tags?: string[];
  machineTags?: string[];
  geoData?: Geo;
  media?: string;
  pathAlias?: string;
  images: FlickrImage[];
  thumbnails: FlickrThumbnail[];
};

type FlickrApiExtras = ReadonlyArray<keyof typeof extras>;

type IPluginOptionsKeys = {
  api_key: string;
  username: string;
  extras: FlickrApiExtras;
};

/**
 * Gatsby expects the plugin options to be of type "PluginOptions" for gatsby-node APIs (e.g. sourceNodes)
 */
export interface IPluginOptionsInternal
  extends IPluginOptionsKeys,
    GatsbyDefaultPluginOptions {}

/**
 * These are the public TypeScript types for consumption in gatsby-config
 */
export interface IPluginOptions extends IPluginOptionsKeys, IPluginRefOptions {}
