/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Add galleryImages file field to galleries collection
 *
 * JSON `images` field stores metadata (section, caption, order);
 * `galleryImages` stores actual files. PocketBase does not allow duplicate names,
 * so the file field MUST be named `galleryImages` (not `images`).
 *
 * Idempotent: checks if field exists before creating.
 */
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("galleries");

  // Check if galleryImages field already exists
  const existing = collection.schema.getFieldByName("galleryImages");
  if (existing) {
    console.log("galleryImages field already exists, skipping");
    return;
  }

  // Create the file field with image-specific options
  const field = new SchemaField({
    name: "galleryImages",
    type: "file",
    required: false,
    options: {
      maxSelect: null, // unlimited files
      maxSize: 10485760, // 10 MB per file
      mimeTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
      ],
      thumbs: [
        "100x100",
        "300x300",
        "600x600",
      ],
    },
  });

  collection.schema.addField(field);
  dao.saveCollection(collection);

  console.log("Added galleryImages file field to galleries collection");
}, (db) => {
  // Revert: remove galleryImages field
  try {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("galleries");
    collection.schema.removeField("galleryImages");
    dao.saveCollection(collection);
    console.log("Removed galleryImages field from galleries collection");
  } catch (e) {
    if (e.message.includes("no rows in result set")) {
      console.log("Collection not found, skipping revert");
      return;
    }
    throw e;
  }
});
