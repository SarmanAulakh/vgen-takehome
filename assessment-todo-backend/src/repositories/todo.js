export default (db) => {
  const { TODO_COLLECTION } = process.env;
  const collection = db.collection(TODO_COLLECTION);

  async function insertOne(todo) {
    return await collection.insertOne(todo);
  }

  async function getAllByUserId(userID) {
    return await collection.find({ userID }).toArray();
  }

  async function updateCompletedStatus(userID, todoID, completed) {
    const todo = await collection.findOne({ todoID, userID });
    if (!todo) {
      throw new Error("Todo not found or user not authorized to update.");
    }

    const result = await collection.findOneAndUpdate(
      { todoID },
      { $set: { completed } },
      { returnDocument: "after" }
    );

    if (result.lastErrorObject.updatedExisting) {
      return result.value;
    }
    return null;
  }

  return {
    insertOne,
    getAllByUserId,
    updateCompletedStatus,
  };
};
