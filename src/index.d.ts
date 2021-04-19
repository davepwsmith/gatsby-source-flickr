export type FlickrPhoto = {
  id: string | null;
  owner: string | null;
  secret: string | null;
  server: string | null;
  farm: number | string | null;
  title: string | null;
  ispublic: number | null;
  isfriend: number | null;
  isfamily: number | null;
  license?: number | null;
  description?: Description;
  dateupload?: string | null;
  lastupdate?: string | null;
  datetaken?: string | null;
  datetakengranularity?: number | null;
  datetakenunknown?: number | null;
  ownername?: string | null;
  iconserver?: string | null;
  iconfarm?: number | null;
  views?: number | null;
  tags?: string | null;
  machine_tags?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  context?: number | null;
  media?: string | null;
  media_status?: string | null;
  url_sq?: string | null;
  height_sq?: number | null;
  width_sq?: number | null;
  url_t?: string | null;
  height_t?: number | null;
  width_t?: number | null;
  url_s?: string | null;
  height_s?: string | null;
  width_s?: string | null;
  url_q?: string | null;
  height_q?: string | null;
  width_q?: string | null;
  url_m?: string | null;
  height_m?: string | null;
  width_m?: string | null;
  url_n?: string | null;
  height_n?: string | null;
  width_n?: string | null;
  url_z?: string | null;
  height_z?: string | null;
  width_z?: string | null;
  url_c?: string | null;
  height_c?: string | null;
  width_c?: string | null;
  url_l?: string | null;
  height_l?: string | null;
  width_l?: string | null;
  url_h?: string | null;
  height_h?: string | null;
  width_h?: string | null;
  url_k?: string | null;
  height_k?: string | null;
  width_k?: string | null;
  pathalias?: string | null;
  woeid?: number | string | null;
  placeid?: string | null;
};

type Description = {
  _content: string | null;
};

export type ImageUrl = {
  url: string;
  height: number;
  width: number;
  orientation: "landscape" | "portrait" | "square";
};

export type ImageUrls = {
  sq_75px: ImageUrl;
  sq_150px: ImageUrl;
  _100px: ImageUrl;
  _240px: ImageUrl;
  _320px: ImageUrl;
  _500px: ImageUrl;
  _640px: ImageUrl;
  _800px: ImageUrl;
  _1024px: ImageUrl;
  _1600px: ImageUrl;
  _2048px: ImageUrl;
  original: ImageUrl;
};

type Geo = {
  permissions: {
    is_public: number | null;
    is_friend: number | null;
    is_family: number | null;
    is_contact: number | null;
  };
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  context?: number | null;
  woeid: number | string | null;
  placeid: number | string | null;
};

export type Photo = {
  photo_id: string | null;
  owner: string | null;
  ownername?: string | null;
  title: string | null;
  license?: number | null;
  description?: string | null;
  upload_date?: Date | null;
  lastupdate_date?: Date | null;
  datetaken?: string | null;
  views?: number | null;
  tags?: string | null;
  machine_tags?: string | null;
  geo: Geo;
  media?: string | null;
  media_status?: string | null;
  imageUrls: ImageUrls;
};
