/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("galleries");
  const field = collection.fields.getByName("galleryType");
  field.values = ["editorial", "documentary", "minimal", "cinematic", "atelier-editorial"];
  return app.save(collection);
}, (app) => {
  try {
  const collection = app.findCollectionByNameOrId("galleries");
  const field = collection.fields.getByName("galleryType");
  if (!field) { console.log("Field not found, skipping revert"); return; }
  field.values = ["editorial", "documentary", "minimal", "cinematic"];
  return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection or field not found, skipping revert");
      return;
    }
    throw e;
  }
})
