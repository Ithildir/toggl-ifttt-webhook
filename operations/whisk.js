const cheerio = require('cheerio');
const superagent = require('superagent');

const { WHISK_TOKEN } = process.env;

async function extractRecipe(url) {
  const { body } = await superagent
    .post('https://my.whisk.com/api/grpc/v1/recipes/extract')
    .set('Authorization', `Bearer ${WHISK_TOKEN}`)
    .send({ url });

  if (body.recipe && body.recipe.id) {
    return { recipe_id: body.recipe.id };
  }

  if (body.partially_parsed) {
    return {
      payload: {
        ...body.partially_parsed,
        images: body.partially_parsed.images.map((image) => ({
          url: image.original.url,
        })),
      },
    };
  }

  throw new Error(
    `Unknown Whisk extract recipe response: ${JSON.stringify(body)}`
  );
}

async function parseOneGreenPlanet(recipe) {
  const {
    name,
    source: { source_recipe_url: url },
  } = recipe;

  const { text } = await superagent.get(url);

  const $ = cheerio.load(text);

  const getTexts = (selector) =>
    $(selector)
      // eslint-disable-next-line func-names
      .map(function () {
        const li = $(this);

        return {
          text: li.text().replace(String.fromCharCode(160), ' ').trim(),
        };
      })
      .get();

  const { id, saved, user, ...recipeRest } = recipe;

  return {
    payload: {
      ...recipeRest,
      images: recipe.images.map((image) => ({
        url: image.original.url,
      })),
      ingredients: getTexts('.recipe-ingredients li'),
      instructions: getTexts('.recipe-preparation li'),
      name: name.replace(' [Vegan]', ''),
    },
    update_mask: {
      paths: ['payload'],
    },
  };
}

function patchRecipe(recipeId, patchRecipeReq) {
  return superagent
    .patch(`https://my.whisk.com/api/grpc/v1/recipes/${recipeId}`)
    .set('Authorization', `Bearer ${WHISK_TOKEN}`)
    .send(patchRecipeReq);
}

async function postRecipe(req) {
  const { body } = await superagent
    .post('https://my.whisk.com/api/grpc/v1/recipes')
    .set('Authorization', `Bearer ${WHISK_TOKEN}`)
    .send(req);

  return body.recipe;
}

async function addRecipe(url) {
  const postRecipeReq = await extractRecipe(url);

  const recipe = await postRecipe(postRecipeReq);

  let patchRecipeReq;

  if (url.includes('onegreenplanet.org')) {
    patchRecipeReq = await parseOneGreenPlanet(recipe);
  }

  if (patchRecipeReq) {
    await patchRecipe(recipe.id, patchRecipeReq);
  }
}

module.exports = {
  addRecipe,
};
