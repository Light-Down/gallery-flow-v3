/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("galleries");

  const record0 = new Record(collection);
    record0.set("slug", "anna-david-tuscany-wedding");
    record0.set("title", "Anna & David \u2014 Tuscany Wedding");
    record0.set("coupleNames", "Anna & David");
    record0.set("date", "2024-06-15");
    record0.set("location", "Tuscany, Italy");
    record0.set("coverImage", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/8b980b0a4897b2228f0741f885f3fd21.webp");
    record0.set("imageBasePath", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/");
    record0.set("imageCount", 8);
    record0.setPassword("tuscany2024");
    record0.set("isActive", true);
    record0.set("galleryType", "cinematic");
    record0.set("isFeatured", true);
    record0.set("sortOrder", 1);
    record0.set("heroImage", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/8b980b0a4897b2228f0741f885f3fd21.webp");
    record0.set("sections", [{"id": "sec1", "sectionTitle": "Morning Light", "startImageIndex": 1, "endImageIndex": 2, "isVisible": true, "order": 1}, {"id": "sec2", "sectionTitle": "First Look", "startImageIndex": 3, "endImageIndex": 4, "isVisible": true, "order": 2}, {"id": "sec3", "sectionTitle": "Celebration", "startImageIndex": 5, "endImageIndex": 6, "isVisible": true, "order": 3}, {"id": "sec4", "sectionTitle": "Golden Hour", "startImageIndex": 7, "endImageIndex": 8, "isVisible": true, "order": 4}]);
  try {
    app.save(record0);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record1 = new Record(collection);
    record1.set("slug", "sophie-elias-frankfurt-wedding");
    record1.set("title", "Sophie & Elias \u2014 Frankfurt Wedding");
    record1.set("coupleNames", "Sophie & Elias");
    record1.set("date", "2024-07-20");
    record1.set("location", "Frankfurt, Germany");
    record1.set("coverImage", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/01698567edc3624e093b1951206fb6f8.webp");
    record1.set("imageBasePath", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/");
    record1.set("imageCount", 8);
    record1.setPassword("frankfurt2024");
    record1.set("isActive", true);
    record1.set("galleryType", "documentary");
    record1.set("isFeatured", true);
    record1.set("sortOrder", 2);
    record1.set("heroImage", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/01698567edc3624e093b1951206fb6f8.webp");
    record1.set("sections", [{"id": "sec1", "sectionTitle": "Getting Ready", "startImageIndex": 1, "endImageIndex": 2, "isVisible": true, "order": 1}, {"id": "sec2", "sectionTitle": "The Moment", "startImageIndex": 3, "endImageIndex": 4, "isVisible": true, "order": 2}, {"id": "sec3", "sectionTitle": "With Friends", "startImageIndex": 5, "endImageIndex": 6, "isVisible": true, "order": 3}, {"id": "sec4", "sectionTitle": "Departure", "startImageIndex": 7, "endImageIndex": 8, "isVisible": true, "order": 4}]);
  try {
    app.save(record1);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }

  const record2 = new Record(collection);
    record2.set("slug", "clara-jonas-intimate-garden-wedding");
    record2.set("title", "Clara & Jonas \u2014 Intimate Garden Wedding");
    record2.set("coupleNames", "Clara & Jonas");
    record2.set("date", "2024-05-10");
    record2.set("location", "Garden Estate, Switzerland");
    record2.set("coverImage", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/ed74c92802f692f24190c757f4984a29.webp");
    record2.set("imageBasePath", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/");
    record2.set("imageCount", 8);
    record2.setPassword("garden2024");
    record2.set("isActive", true);
    record2.set("galleryType", "minimal");
    record2.set("isFeatured", true);
    record2.set("sortOrder", 3);
    record2.set("heroImage", "https://horizons-cdn.hostinger.com/dd4378bc-b86d-4fca-8d05-d3e1745a355d/ed74c92802f692f24190c757f4984a29.webp");
    record2.set("sections", [{"id": "sec1", "sectionTitle": "Preparation", "startImageIndex": 1, "endImageIndex": 2, "isVisible": true, "order": 1}, {"id": "sec2", "sectionTitle": "First Look", "startImageIndex": 3, "endImageIndex": 4, "isVisible": true, "order": 2}, {"id": "sec3", "sectionTitle": "Joy", "startImageIndex": 5, "endImageIndex": 6, "isVisible": true, "order": 3}, {"id": "sec4", "sectionTitle": "Timeless", "startImageIndex": 7, "endImageIndex": 8, "isVisible": true, "order": 4}]);
  try {
    app.save(record2);
  } catch (e) {
    if (e.message.includes("Value must be unique")) {
      console.log("Record with unique value already exists, skipping");
    } else {
      throw e;
    }
  }
}, (app) => {
  // Rollback: record IDs not known, manual cleanup needed
})
