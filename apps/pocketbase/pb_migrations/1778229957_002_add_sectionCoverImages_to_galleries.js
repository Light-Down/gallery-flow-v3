/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("galleries");

  const existing = collection.fields.getByName("sectionCoverImages");
  if (existing) {
    if (existing.type === "json") {
      return; // field already exists with correct type, skip
    }
    collection.fields.removeByName("sectionCoverImages"); // exists with wrong type, remove first
  }

  collection.fields.add(new JSONField({
    name: "sectionCoverImages",
    required: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("galleries");
    collection.fields.removeByName("sectionCoverImages");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
})
