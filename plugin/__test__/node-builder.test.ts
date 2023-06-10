import { fixDate } from "../src/node-builder";
describe("fixDate Function", () => {
  test("It returns the right date for 2023-01-01 as a Unix timestamp (number)", () => {
    expect(fixDate(1672531200)).toEqual(new Date("2023-01-01"));
  });

  test("It returns the right date for 2023-01-01 as a Unix timestamp (string)", () => {
    expect(fixDate("1672531200")).toEqual(new Date("2023-01-01"));
  });

  test("It returns the right date for 2023-01-01 as an ISO date", () => {
    expect(fixDate("2023-01-01 12:00:00")).toEqual(
      new Date("2023-01-01T12:00:00.000000Z")
    );
  });

  test("It returns undefined if date cannot be parsed", () => {
    expect(fixDate("underpants")).toBe(undefined);
  });
});

import { getSizeDetails } from "../src/node-builder";
import flickrPhotoSparse from "./fixtures/flickrphotosparse.json";
describe("getSizeDetails Function", () => {
  test("It returns an image object for images", () => {
    const photo = {
      ...flickrPhotoSparse,
      width_m: 333,
      height_m: 500,
      url_m: "URL_M_TEST",
    };
    expect(getSizeDetails(photo, "m")).toStrictEqual({
      width: 333,
      height: 500,
      src: "URL_M_TEST",
      orientation: "portrait",
      label: "m",
    });
  });

  test("It handles stringified dimensions", () => {
    const photo = {
      ...flickrPhotoSparse,
      width_m: "333",
      height_m: "500",
      url_m: "URL_M_TEST",
    };
    expect(getSizeDetails(photo, "m")).toStrictEqual({
      width: 333,
      height: 500,
      src: "URL_M_TEST",
      orientation: "portrait",
      label: "m",
    });
  });

  test("It detects orientation", () => {
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
    expect(getSizeDetails(portrait, "m").orientation).toBe("portrait");
    expect(getSizeDetails(landscape, "m").orientation).toBe("landscape");
    expect(getSizeDetails(square, "m").orientation).toBe("square");
  });

  test("It returns null for missing properties", () => {
    const photo = {
      ...flickrPhotoSparse,
      width_m: "333",
      height_m: "500",
    };
    expect(getSizeDetails(photo, "k")).toBe(null);
  });

  test("It returns null for no photos", () => {
    expect(getSizeDetails(flickrPhotoSparse, "m")).toBe(null);
  });
});

import { sizes } from "../src/constants";
import flickrPhoto from "./fixtures/flickrphotofull.json";
import { getThumbnails } from "../src/node-builder";
describe("getThumbnails Function", () => {
  const thumbs = getThumbnails(flickrPhoto);

  test("Three thumbnails produced", () => {
    expect(thumbs.length).toBe(3);
  });

  test("Only thumbnail sizes included", () => {
    expect(
      thumbs.map((x) => sizes.THUMBS.includes(x.label)).every((x) => x === true)
    ).toBe(true);
  });
});

import { getImages } from "../src/node-builder";
describe("getPhotos Function", () => {
  const images = getImages(flickrPhoto);

  test("Eight Images produced", () => {
    expect(images.length).toBe(8);
  });

  test("No nulls in array", () => {
    expect(images.every((x) => x != null)).toBe(true);
  });

  test("Only full image sizes included", () => {
    expect(
      images
        .map((x) => [...sizes.CROPS, ...sizes.ORIG].includes(x.label))
        .every((x) => x === true)
    ).toBe(true);
  });
});

import { getGeoDetails } from "../src/node-builder";
describe("getGeoDetails function", () => {
  const photo = {
    ...flickrPhotoSparse,
    longitude: 0,
    latitude: 0,
    geo_is_public: 0,
    geo_is_family: 0,
    geo_is_friend: 0,
    geo_is_contact: 0,
    accuracy: 0,
    context: 0,
    place_id: "abc",
    woeid: 0,
  };

  test("It maps the data to the correct shape", () => {
    expect(getGeoDetails(photo)).toEqual({
      permissions: {
        is_public: 0,
        is_family: 0,
        is_friend: 0,
        is_contact: 0,
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
