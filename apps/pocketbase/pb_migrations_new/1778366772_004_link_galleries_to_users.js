/// <reference path="../pb_data/types.d.ts" />

/**
 * Migration: Link galleries to users via relation field
 *
 * Creates a `galleryUser` relation field on the galleries collection
 * pointing to the users collection. Populates it from the temporary
 * `userId` text field set by migration 003.
 *
 * Idempotent: skips if galleryUser field already exists or is already populated.
 */
migrate((db) => {
  const dao = new Dao(db);

  const galleriesCollection = dao.findCollectionByNameOrId("galleries");
  const usersCollection = dao.findCollectionByNameOrId("users");

  // Check if galleryUser relation field already exists
  let galleryUserField = galleriesCollection.schema.getFieldByName("galleryUser");
  if (!galleryUserField) {
    // Create the relation field linking galleries to users
    galleryUserField = new SchemaField({
      name: "galleryUser",
      type: "relation",
      required: false,
      options: {
        collectionId: usersCollection.id,
        cascadeDelete: false,
        maxSelect: 1,
      },
    });
    galleriesCollection.schema.addField(galleryUserField);
    dao.saveCollection(galleriesCollection);
    console.log("Created galleryUser relation field on galleries collection");
  } else {
    console.log("galleryUser relation field already exists, skipping creation");
  }

  // Populate galleryUser from userId for all galleries that have userId set
  const galleries = dao.findRecordsByFilter(
    "galleries",
    "userId != '' && userId != null",
    "",
    0,
    0
  );

  let populatedCount = 0;
  let skippedCount = 0;

  for (const gallery of galleries) {
    // Idempotent: skip if galleryUser is already populated
    const existingGalleryUser = gallery.get("galleryUser");
    if (existingGalleryUser && existingGalleryUser !== "") {
      skippedCount++;
      continue;
    }

    const userId = gallery.get("userId");
    if (userId && userId !== "") {
      gallery.set("galleryUser", userId);
      dao.saveRecord(gallery);
      populatedCount++;
    }
  }

  console.log(
    `Populated galleryUser for ${populatedCount} galleries, skipped ${skippedCount} already linked`
  );

  // Optionally remove the temporary userId text field now that relation is established
  // Commented out for safety — can be removed in a future migration after verification
  // const userIdField = galleriesCollection.schema.getFieldByName("userId");
  // if (userIdField) {
  //   galleriesCollection.schema.removeField("userId");
  //   dao.saveCollection(galleriesCollection);
  //   console.log("Removed temporary userId field from galleries collection");
  // }
}, (db) => {
  // Revert: remove galleryUser relation field from galleries
  try {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("galleries");
    collection.schema.removeField("galleryUser");
    dao.saveCollection(collection);
    console.log("Reverted: removed galleryUser relation field");
  } catch (e) {
    if (e.message.includes("no rows in result set") || e.message.includes("Missing schema field")) {
      console.log("Field or collection not found, skipping revert");
      return;
    }
    throw e;
  }
});
