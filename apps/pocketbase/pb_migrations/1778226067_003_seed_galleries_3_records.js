/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("galleries");

  const record0 = new Record(collection);
    record0.set("slug", "mueller-schmidt");
    record0.set("coupleNames", "Anna & David");
    record0.set("title", "Tuscany Wedding");
    record0.set("date", "2024-06-15");
    record0.set("location", "Tuscany, Italy");
    record0.set("imageCount", 248);
    record0.setPassword("tuscany2024");
    record0.set("imageBasePath", "/galleries/mueller-schmidt/");
    record0.set("expirationDate", "2025-06-15");
    record0.set("sections", [{"name": "Getting Ready", "startImage": 1, "endImage": 20}, {"name": "First Look", "startImage": 21, "endImage": 35}, {"name": "Ceremony", "startImage": 36, "endImage": 60}, {"name": "Couple Shoot", "startImage": 61, "endImage": 120}, {"name": "Family & Friends", "startImage": 121, "endImage": 180}, {"name": "Party", "startImage": 181, "endImage": 248}]);
    record0.set("isActive", true);
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
    record1.set("slug", "weber-mueller");
    record1.set("coupleNames", "Sophie & Elias");
    record1.set("title", "Frankfurt Wedding");
    record1.set("date", "2024-09-08");
    record1.set("location", "Frankfurt, Germany");
    record1.set("imageCount", 195);
    record1.setPassword("frankfurt2024");
    record1.set("imageBasePath", "/galleries/weber-mueller/");
    record1.set("expirationDate", "2025-09-08");
    record1.set("sections", [{"name": "Getting Ready", "startImage": 1, "endImage": 18}, {"name": "First Look", "startImage": 19, "endImage": 32}, {"name": "Ceremony", "startImage": 33, "endImage": 55}, {"name": "Couple Shoot", "startImage": 56, "endImage": 110}, {"name": "Family & Friends", "startImage": 111, "endImage": 165}, {"name": "Party", "startImage": 166, "endImage": 195}]);
    record1.set("isActive", true);
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
    record2.set("slug", "mueller-weber");
    record2.set("coupleNames", "Clara & Jonas");
    record2.set("title", "Intimate Garden Wedding");
    record2.set("date", "2024-05-22");
    record2.set("location", "Berlin, Germany");
    record2.set("imageCount", 170);
    record2.setPassword("garden2024");
    record2.set("imageBasePath", "/galleries/mueller-weber/");
    record2.set("expirationDate", "2025-05-22");
    record2.set("sections", [{"name": "Getting Ready", "startImage": 1, "endImage": 15}, {"name": "First Look", "startImage": 16, "endImage": 28}, {"name": "Ceremony", "startImage": 29, "endImage": 50}, {"name": "Couple Shoot", "startImage": 51, "endImage": 95}, {"name": "Family & Friends", "startImage": 96, "endImage": 140}, {"name": "Party", "startImage": 141, "endImage": 170}]);
    record2.set("isActive", true);
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
