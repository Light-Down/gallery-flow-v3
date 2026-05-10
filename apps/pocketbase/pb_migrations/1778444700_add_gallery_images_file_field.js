/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("galleries");

  const existing = collection.fields.getByName("galleryImages");
  if (existing) {
    if (existing.type === "file") {
      return;
    }
    collection.fields.removeByName("galleryImages");
  }

  collection.fields.add(new FileField({
    name: "galleryImages",
    required: false,
    maxSelect: 500,
    maxSize: 10485760,
    mimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic"
    ],
    thumbs: [
      "100x100",
      "300x300",
      "600x600"
    ],
    protected: false
  }));

  return app.save(collection);
}, (app) => {
  try {
    const collection = app.findCollectionByNameOrId("galleries");
    collection.fields.removeByName("galleryImages");
    return app.save(collection);
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      return;
    }
    throw e;
  }
});
