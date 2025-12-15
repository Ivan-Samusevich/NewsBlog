const slugify = require('slugify');

const WORDS_PER_MINUTE = 200;

// Функция для генерации slug
const generateSlug = (title) => {
  return slugify(title, { lower: true, strict: true });
};

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;

    // title и content могут быть в двух местах (REST API / админка)
    const title = data.title || data.attributes?.title;
    const content = data.content || data.attributes?.content;

    strapi.log.info("=== BEFORE CREATE HOOK TRIGGERED ===");

    // Генерация slug только если его нет
    if (title) {
      const slug = generateSlug(title);
      if (data.title !== undefined) data.slug = slug;
      else if (data.attributes) data.attributes.slug = slug;
    }

    // Подсчёт readingTime
    if (content) {
      const words = content.split(/\s+/).length;
      const readingTime = Math.ceil(words / WORDS_PER_MINUTE);
      if (data.content !== undefined) data.readingTime = readingTime;
      else if (data.attributes) data.attributes.readingTime = readingTime;
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;

    const content = data.content || data.attributes?.content;

    strapi.log.info("=== BEFORE UPDATE HOOK TRIGGERED ===");

    // Не трогаем slug при обновлении, чтобы не создавать дубликаты

    // Обновляем readingTime
    if (content) {
      const words = content.split(/\s+/).length;
      const readingTime = Math.ceil(words / WORDS_PER_MINUTE);
      if (data.content !== undefined) data.readingTime = readingTime;
      else if (data.attributes) data.attributes.readingTime = readingTime;
    }
  },
};
  