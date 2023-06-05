import type { GatsbyNode } from "gatsby";

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] = ({
  actions,
}) => {
  const { createTypes } = actions;

  const typedefs = `
    type FlickrPhoto implements Node {
      _id: String!
      owner: String!
      ownerName: String
      title: String!
      license: String
      description: String
      upload_date: Date
      lastupdate_date: Date
      datetaken: Date
      views: Int
      tags: String
      machine_tags: String
      geo: Geo
      media: String
      media_status: String
      imageUrls: [ImageUrl]
      thumbnailUrls: [ImageUrl]
    } 

    type GeoPermissions {
      is_public: Int
      is_friend: Int
      is_family: Int
      is_contact: Int
    }

    type Geo {
      permissions: GeoPermissions,
      latitude: Float
      longitude: Float
      accuracy: Float
      context: Float
      woeid: String
      placeid: String
    }

    type ImageUrl {
      label: String
      height: Int!
      width: Int!
      orientation: String!
      url: String!
    }
  `

  createTypes(typedefs);
};
