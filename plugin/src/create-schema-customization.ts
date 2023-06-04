import type { GatsbyNode } from 'gatsby'

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = ({actions}) => {
    const { createTypes } = actions

    createTypes(`
        type FlickrPhoto implements Node {
            _id: String!
            title: String!
            description: String
            datetaken: Date
            imageUrls: [ImageUrl]
        } 

        type ImageUrl {
            alt: String
            height: Int!
            width: Int!
            orientation: String!
            url: String!
        }
    `)
}