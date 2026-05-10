/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("galleries");

  const existing = collection.fields.getByName("galleryType");
  if (existing) {
    if (existing.type === "select") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("galleryType"); // exists with wrong type, remove first
  }

  collection.fields.add(new SelectField({
    name: "galleryType",
    required: true,
    values: ["editorial", "documentary", "minimal", "cinematic"]
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("galleries");
    collection.fields.removeByName("galleryType");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
