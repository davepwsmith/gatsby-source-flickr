import { buildFlickrPhotoNode } from "../src/node-builder";
import { sizes } from "../src/constants";
import flickrPhotoSparse from "./fixtures/flickrphotosparse.json";
import flickrPhoto from "./fixtures/flickrphotofull.json";
describe("getSizeDetails Function", () => {
  it("Returns an image object for images", () => {
    const photo = {
      ...flickrPhotoSparse,
      width_m: 333,
      height_m: 500,
      url_m: "URL_M_TEST",
    };
    expect(buildFlickrPhotoNode(photo).images[0]).toStrictEqual({
      width: 333,
      height: 500,
      src: "URL_M_TEST",
      orientation: "portrait",
      label: "m",
    });
  });

  it("Handles dimensions passed as strings", () => {
    const photo = {
      ...flickrPhotoSparse,
      width_m: "333",
      height_m: "500",
      url_m: "URL_M_TEST",
    };
    expect(buildFlickrPhotoNode(photo).images[0]).toStrictEqual({
      width: 333,
      height: 500,
      src: "URL_M_TEST",
      orientation: "portrait",
      label: "m",
    });
  });

  it("Handles dimensions passed as a mixture of strings and numbers", () => {
    const photo = {
      ...flickrPhotoSparse,
      width_m: 333,
      height_m: "500",
      url_m: "URL_M_TEST",
    };
    expect(buildFlickrPhotoNode(photo).images[0]).toStrictEqual({
      width: 333,
      height: 500,
      src: "URL_M_TEST",
      orientation: "portrait",
      label: "m",
    });
  });

  it("Detects orientation", () => {
    const portrait = {
      ...flickrPhotoSparse,
      width_m: 1,
      height_m: 2,
      url_m: "PORTRAIT",
    };

    const landscape = {
      ...flickrPhotoSparse,
      width_m: 2,
      height_m: 1,
      url_m: "LANDSCAPE",
    };

    const square = {
      ...flickrPhotoSparse,
      width_m: 1,
      height_m: 1,
      url_m: "square",
    };
    expect(buildFlickrPhotoNode(portrait).images[0]).toHaveProperty(
      "orientation",
      "portrait"
    );
    expect(buildFlickrPhotoNode(landscape).images[0]).toHaveProperty(
      "orientation",
      "landscape"
    );
    expect(buildFlickrPhotoNode(square).images[0]).toHaveProperty(
      "orientation",
      "square"
    );
  });

  it("Returns null for missing properties", () => {
    const photo = {
      ...flickrPhotoSparse,
      width_m: "333",
      height_m: "500",
    };
    expect(buildFlickrPhotoNode(photo).images).toHaveLength(0);
  });

  it("Returns null for no photos", () => {
    expect(buildFlickrPhotoNode(flickrPhotoSparse).images).toHaveLength(0);
  });
});

describe("getThumbnails Function", () => {
  const thumbs = buildFlickrPhotoNode(flickrPhoto).thumbnails;

  it("Produces three thumbnails", () => {
    expect(thumbs).toHaveLength(3);
  });

  it("Includes only thumbnail sizes", () => {
    expect(
      thumbs.map((x) => sizes.THUMBS.includes(x.label)).every((x) => x === true)
    ).toBe(true);
  });
});

describe("getPhotos Function", () => {
  const images = buildFlickrPhotoNode(flickrPhoto).images;

  it("Produces eight Images", () => {
    expect(images).toHaveLength(8);
  });

  it("Has no nulls in array", () => {
    expect(images.every((x) => x != null)).toBe(true);
  });

  it("Only includes full image sizes", () => {
    expect(
      images
        .map((x) => [...sizes.CROPS, ...sizes.ORIG].includes(x.label))
        .every((x) => x === true)
    ).toBe(true);
  });
});

describe("getGeoDetails function", () => {
  const photo = {
    ...flickrPhotoSparse,
    longitude: 0,
    latitude: 0,
    geo_is_public: 1,
    geo_is_family: 0,
    geo_is_friend: 0,
    geo_is_contact: 0,
    accuracy: 0,
    context: 0,
    place_id: "abc",
    woeid: 0,
  };

  it("Maps the data to the correct shape", () => {
    expect(buildFlickrPhotoNode(photo).geoData).toEqual({
      permissions: {
        public: true,
        family: false,
        friend: false,
        contact: false,
      },
      longitude: 0,
      latitude: 0,
      accuracy: 0,
      context: 0,
      place_id: "abc",
      woeid: 0,
    });
  });
});

describe("fixDate Function", () => {
  it("Returns the right date for 2023-01-01 as a Unix timestamp (number)", () => {
    expect(
      buildFlickrPhotoNode({ ...flickrPhotoSparse, dateupload: 1672531200 })
        .dateUploaded
    ).toEqual(new Date("2023-01-01"));
  });

  it("Returns the right date for 2023-01-01 as a Unix timestamp (string)", () => {
    expect(
      buildFlickrPhotoNode({ ...flickrPhotoSparse, dateupload: "1672531200" })
        .dateUploaded
    ).toEqual(new Date("2023-01-01"));
  });

  it("Returns the right date for 2023-01-01 as an ISO date", () => {
    expect(
      buildFlickrPhotoNode({
        ...flickrPhotoSparse,
        datetaken: "2023-01-01 12:00:00",
      }).dateTaken
    ).toEqual(new Date("2023-01-01T12:00:00.000000Z"));
  });

  it("Returns undefined if date cannot be parsed", () => {
    expect(
      buildFlickrPhotoNode({ ...flickrPhotoSparse, datetaken: "not a date" })
        .dateTaken
    ).toBe(undefined);
  });
});

import flickrLicenses from "./fixtures/flickrlicenses.json";
const licenses = flickrLicenses.licenses.license;
describe("getLicense Function", () => {
  it("Returns the correct license given a number", () => {
    expect(
      buildFlickrPhotoNode({ ...flickrPhotoSparse, license: 1 }, licenses)
        .license
    ).toHaveProperty("_id", 1);
  });
  it("Returns the correct license given a string", () => {
    expect(
      buildFlickrPhotoNode({ ...flickrPhotoSparse, license: "1" }, licenses)
        .license
    ).toHaveProperty("_id", 1);
  });
  it("Returns returns undefined when not passed a license", () => {
    expect(buildFlickrPhotoNode(flickrPhotoSparse, licenses).license).toBe(
      undefined
    );
  });
});

describe("fixPermissions Function", () => {
  const permissions = {
    ...flickrPhotoSparse,
    ispublic: 1,
    isfriend: 0,
    isfamily: 0,
  };
  const geo_permissions = {
    ...flickrPhotoSparse,
    geo_is_public: 1,
    geo_is_friend: 0,
    geo_is_family: 0,
    geo_is_contact: 0,
  };
  it("Returns correctly formatted permissions with no prefix", () => {
    expect(buildFlickrPhotoNode(permissions).permissions).toEqual({
      public: true,
      friend: false,
      family: false,
    });
  });
  it("Returns correctly formatted permissions with prefix", () => {
    expect(buildFlickrPhotoNode(geo_permissions).geoData?.permissions).toEqual({
      public: true,
      friend: false,
      family: false,
      contact: false,
    });
  });
});

describe("buildFlickrPhotoNode Function", () => {
  it("Returns a formatted Photo object", () => {
    expect(buildFlickrPhotoNode(flickrPhoto, licenses)).toEqual({
      _id: "52470951550",
      dateLastUpdated: new Date("2022-11-05T16:32:54.000Z"),
      dateTaken: new Date("2022-11-01T18:42:51.000Z"),
      dateUploaded: new Date("2022-11-01T18:43:12.000Z"),
      description: "description",
      geoData: {
        accuracy: 0,
        context: 0,
        latitude: 0,
        longitude: 0,
        permissions: undefined,
      },
      images: [
        {
          height: 240,
          label: "s",
          orientation: "portrait",
          src: "photo_url",
          width: 160,
        },
        {
          height: 320,
          label: "n",
          orientation: "portrait",
          src: "photo_url",
          width: 213,
        },
        {
          height: 500,
          label: "m",
          orientation: "portrait",
          src: "photo_url",
          width: 333,
        },
        {
          height: 640,
          label: "z",
          orientation: "portrait",
          src: "photo_url",
          width: 427,
        },
        {
          height: 800,
          label: "c",
          orientation: "portrait",
          src: "photo_url",
          width: 533,
        },
        {
          height: 1024,
          label: "l",
          orientation: "portrait",
          src: "photo_url",
          width: 683,
        },
        {
          height: 1600,
          label: "h",
          orientation: "portrait",
          src: "photo_url",
          width: 1066,
        },
        {
          height: 2048,
          label: "k",
          orientation: "portrait",
          src: "photo_url",
          width: 1365,
        },
      ],
      license: { _id: 0, name: "All Rights Reserved", url: "" },
      machineTags: undefined,
      media: "photo",
      owner: "owner",
      ownerName: "ownername",
      pathAlias: "pathalias",
      permissions: { family: false, friend: false, public: true },
      tags: ["t1", "t2", "t3"],
      thumbnails: [
        {
          height: 75,
          label: "sq",
          orientation: "square",
          src: "photo_url",
          width: 75,
        },
        {
          height: 150,
          label: "q",
          orientation: "square",
          src: "photo_url",
          width: 150,
        },
        {
          height: 100,
          label: "t",
          orientation: "portrait",
          src: "photo_url",
          width: 67,
        },
      ],
      title: "title",
      views: 12,
    });
  });
  it("Returns errors to be caught in sourceNode", () => {
    expect(
      // @ts-expect-error To test unexpected input from flickr API
      buildFlickrPhotoNode()
    ).toBeInstanceOf(Error);
    const badPhoto = {
      error: "message",
    };
    // @ts-expect-error To test unexpected input from flickr API
    console.log(buildFlickrPhotoNode(badPhoto));
    // @ts-expect-error To test unexpected input from flickr API
    expect(buildFlickrPhotoNode(badPhoto)).toBeInstanceOf(Error);
  });
});
