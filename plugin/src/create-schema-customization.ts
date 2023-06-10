import type { GatsbyNode } from "gatsby";

export const createSchemaCustomization: GatsbyNode["createSchemaCustomization"] =
  ({ actions }) => {
    const { createTypes } = actions;

    const typedefs = `
    type FlickrPhoto implements Node {
      _id: String!
      owner: String!
      ownerName: String
      title: String!
      license: License
      description: String
      dateUploaded: Date
      dateLastUpdated: Date
      dateTaken: Date
      views: Int
      geoData: Geo
      tags: [String]
      machineTags: [String]
      media: String
      pathAlias: String
      images: [FlickrImage]!
      thumbnails: [FlickrImage]!
    } 

    type License {
      _id: Int!, 
      name: String!,
      url: String!
    }

    type GeoPermissions {
      is_public: Boolean
      is_friend: Boolean
      is_family: Boolean
      is_contact: Boolean
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

    type FlickrImage {
      label: String
      height: Int!
      width: Int!
      orientation: String!
      src: String!
    }
  `;

    createTypes(typedefs);
  };
