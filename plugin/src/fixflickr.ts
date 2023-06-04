import { FlickrPhoto, Photo, ImageUrl } from "./types";

import { sizes } from "./constants";

export const fixPhoto = (photo: FlickrPhoto): Photo => {
    const fixed: any = photo;
  
    // Don't name crash with node.id
    fixed._id = fixed.id;
    delete fixed.id;
  
    // Some fields can come down as either string or number. GraphQL doesn't like that. Force everything to number
  
    Object.keys(sizes).forEach((suffix) => {
      if (Object.prototype.hasOwnProperty.call(fixed, `height_${suffix}`)) {
        fixed[`height_${suffix}`] = parseInt(fixed[`height_${suffix}`]);
      }
      if (Object.prototype.hasOwnProperty.call(fixed, `width_${suffix}`)) {
        fixed[`width_${suffix}`] = parseInt(fixed[`width_${suffix}`]);
      }
    });
  
    if (Object.prototype.hasOwnProperty.call(fixed, "accuracy")) {
      fixed.accuracy = parseInt(fixed.accuracy);
    }
    if (Object.prototype.hasOwnProperty.call(fixed, "context")) {
      fixed.context = parseInt(fixed.context);
    }
  
    // A missing latitude or longitude can come down as either 0 or "0" - force to number
  
    if (Object.prototype.hasOwnProperty.call(fixed, "latitude")) {
      fixed.latitude = parseFloat(fixed.latitude);
    }
    if (Object.prototype.hasOwnProperty.call(fixed, "longitude")) {
      fixed.longitude = parseFloat(fixed.longitude);
    }
  
    // These can come down as either string or number. Have only ever seen "0" and 0 here - and documentation is sparse - remove them
  
    if (Object.prototype.hasOwnProperty.call(fixed, "datetakengranularity")) {
      delete fixed.datetakengranularity;
    }
    if (Object.prototype.hasOwnProperty.call(fixed, "datetakenunknown")) {
      delete fixed.datetakenunknown;
    }
  
    // Convert Date versions of dateupload and lastupdate
  
    if (Object.prototype.hasOwnProperty.call(fixed, "dateupload")) {
      fixed.upload_date = new Date(fixed.dateupload * 1000);
      delete fixed.dateupload;
    }
    if (Object.prototype.hasOwnProperty.call(fixed, "lastupdate")) {
      fixed.lastupdate_date = new Date(fixed.lastupdate * 1000);
      delete fixed.lastupdate;
    }
  
    // Simplify the structure of the description to just a string
  
    if (Object.prototype.hasOwnProperty.call(fixed, "description")) {
      if (Object.prototype.hasOwnProperty.call(fixed.description, "_content")) {
        fixed.description = fixed.description._content;
      }
    }
  
    // arrange returned object into more sensible format (i.e. not so flat)
  
    fixed.geo = {
      permissions: {},
    };
  
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

    const getSizeDetails = (size): ImageUrl => {
        let sizeDetails
        for(const property in fixed) {
            const lastElem = property.toString().split("_").pop();
            const firstElem = property.toString().split("_").shift();
            
            if (firstElem && lastElem && lastElem == size) {
                sizeDetails = {...sizeDetails, [firstElem]: fixed[property]}
                delete fixed[property]
            }
        }

        if(sizeDetails) {
            sizeDetails.orientation =
            sizeDetails.width === sizeDetails.height
              ? "square"
              : sizeDetails.width > sizeDetails.height
              ? "landscape"
              : "portrait";

            return sizeDetails
        }
        else {
            return null
        }
    }
    const sizesarr = ['sq','q','t','s','n','m','z','c','l','h','k','o']

    fixed.imageUrls = sizesarr.map(x => getSizeDetails(x)).filter(x => x !== null)
  
    for (const property in fixed) {
      const firstElem = property.toString().split("_").shift();
  
      if (geospatial.includes(property)) {
        if (firstElem && firstElem === "geo") {
          fixed.geo.permissions[property.toString().substring(4)] =
            fixed[property];
        } else {
          fixed.geo[property] = fixed[property];
        }
        delete fixed[property];
      }
    }
  
    // delete some useless info:
    // * we use getPublicPhotos so we already know photos
    // are public and we have URLs for the photos in the response)
    // * various server/farm references seem pointless when you have URLs
    // * owner/username are stipuated in the plugin settings - might bring
    // these back if functionality is added to get photos from different places
    // * secret is already included in the URLs that we have mapped
  
    delete fixed.server;
    delete fixed.farm;
    delete fixed.iconserver;
    delete fixed.iconfarm;
    delete fixed.ispublic;
    delete fixed.isfriend;
    delete fixed.isfamily;
    delete fixed.owner;
    delete fixed.secret;

    return fixed;
  }