const { AppDataSource } = require('../data-source');
const { RelationshipType } = require('../entity/RelationshipType');
const { EmotionType } = require('../entity/EmotionType');
const { PostVisibility } = require('../entity/PostVisibility');

async function seed() {
  await AppDataSource.initialize();

  const relationshipTypes = ['Bạn bè', 'Người yêu', 'Chị em', 'Bạn thân'];
  const emotionTypes = [
    'Thích',
    'Yêu thích',
    'Thương thương',
    'Haha',
    'Wow',
    'Buồn',
    'Phẫn nộ',
  ];
  const postVisibilities = ['Bạn bè', 'Công khai', 'Riêng tư'];

  const relationshipTypeRepository =
    AppDataSource.getRepository(RelationshipType);
  for (const name of relationshipTypes) {
    const existingType = await relationshipTypeRepository.findOne({
      where: { name },
    });
    if (!existingType) {
      await relationshipTypeRepository.save({ name });
    }
  }

  const emotionTypeRepository = AppDataSource.getRepository(EmotionType);
  for (const name of emotionTypes) {
    const existingType = await emotionTypeRepository.findOne({
      where: { name },
    });
    if (!existingType) {
      await emotionTypeRepository.save({ name });
    }
  }

  const postVisibilityRepository = AppDataSource.getRepository(PostVisibility);
  for (const name of postVisibilities) {
    const existingType = await postVisibilityRepository.findOne({
      where: { name },
    });
    if (!existingType) {
      await postVisibilityRepository.save({ name });
    }
  }

  await AppDataSource.destroy();
}

seed()
  .then(() => {
    console.log('Seed completed!');
  })
  .catch((error) => {
    console.error('Error seeding data:', error);
  });
