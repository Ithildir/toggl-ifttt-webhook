const { sendStatus, withAuth } = require('../../utils');
const anydo = require('../../operations/anydo');
const habitica = require('../../operations/habitica');

async function asyncSeries(items, fn) {
  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await fn(item);
    } catch (err) {
      console.error(err);
    }
  }
}

function getAnydoCategoryIdPriorities(anydoData) {
  const categoryIdPriorities = {};

  anydoData.models.category.items.forEach((item) => {
    const priorityKey = item.name.toLowerCase();

    if (habitica.PRIORITIES[priorityKey]) {
      categoryIdPriorities[item.id] = priorityKey;
    }
  });

  return categoryIdPriorities;
}

function toHabiticaAlias(taskId) {
  return taskId.replace(/=/g, '-');
}

module.exports = withAuth(async (req, res) => {
  const [anydoData, habiticaActiveTodos, habiticaCompletedTodos] =
    await Promise.all([
      anydo.sync(),
      habitica.getTasks('todos'),
      habitica.getTasks('completedTodos'),
    ]);

  const anydoCategoryIdPriorities = getAnydoCategoryIdPriorities(anydoData);

  const anydoTasksIdToDelete = [];
  const newHabiticaTasks = [];

  anydoData.models.task.items.forEach((item) => {
    const priorityKey = anydoCategoryIdPriorities[item.categoryId];

    if (!priorityKey) {
      console.log(
        `Skipping any.do task "${item.id}" because it belongs to an invalid category`
      );
      return;
    }

    const alias = toHabiticaAlias(item.id);

    if (habiticaCompletedTodos.some((todo) => todo.alias === alias)) {
      anydoTasksIdToDelete.push(item.id);
    } else if (!habiticaActiveTodos.some((todo) => todo.alias === alias)) {
      newHabiticaTasks.push({
        alias,
        priority: habitica.PRIORITIES[priorityKey],
        text: item.title,
        type: 'todo',
      });
    }
  });

  await Promise.all([
    asyncSeries(anydoTasksIdToDelete, (taskId) => anydo.deleteTask({ taskId })),
    asyncSeries(newHabiticaTasks, habitica.createTask),
  ]);

  return sendStatus(res, 200);
});
