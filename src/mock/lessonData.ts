import { Lesson, ExerciseType } from '../types/lesson';

// 辅助函数：根据题型编码返回ExerciseType
function getExerciseType(typeCode: string): ExerciseType {
  const mapping: { [key: string]: ExerciseType } = {
    'W_C-PW_M-C': ExerciseType.T00_LISTEN_SELECT_IMAGE,      // 听音选图
    'PS_C-W_C-C': ExerciseType.T02_PICTURE_SELECT_TEXT,     // 图片选择汉字
    'PW_C-W_M-C': ExerciseType.T04_WORD_MEANING_SELECT,     // 词意选择
    'W_M-PW_C-C': ExerciseType.T02_PICTURE_SELECT_TEXT,     // 根据英文选择图片和汉字
    'V_C-W_C-C': ExerciseType.T03_LISTEN_SELECT_SENTENCE,   // 听力选择句子
    'S_M-S_C-C': ExerciseType.T05_GRAMMAR_SELECT            // 语法选择
  };
  return mapping[typeCode] || ExerciseType.T00_LISTEN_SELECT_IMAGE;
}

// 辅助函数：解析选项和正确答案
function parseOptions(optionsA: string, optionsB: string, optionsC: string, optionsD: string, correctAnswer: string) {
  const options: string[] = [];
  if (optionsA) options.push(optionsA);
  if (optionsB) options.push(optionsB);
  if (optionsC) options.push(optionsC);
  if (optionsD) options.push(optionsD);
  
  // 根据正确答案字母找到对应的选项
  const answerMap: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
  const correctIndex = answerMap[correctAnswer];
  const correct = options[correctIndex] || options[0];
  
  return { options, correct };
}

// 辅助函数：从图片描述中提取emoji或生成占位图片URL
function getImageUrl(imageDesc: string, index: number): string {
  // 如果有emoji，返回emoji
  const emojiMatch = imageDesc.match(/[\u{1F300}-\u{1F9FF}]/u);
  if (emojiMatch) return emojiMatch[0];
  
  // 否则使用占位图片
  const imageMap: { [key: string]: string } = {
    '包子': '🍞', '饺子': '🥟', '米饭': '🍚', '面条': '🍜', '面包': '🥖',
    '水': '💧', '茶': '🍵', '牛奶': '🥛', '水杯': '🥤',
    '猫': '🐱', '狗': '🐶',
    '爸爸': '👨', '妈妈': '👩', '学生': '👨‍🎓',
    '家': '🏠', '饭店': '🏪', '学校': '🏫'
  };
  
  for (const [key, emoji] of Object.entries(imageMap)) {
    if (imageDesc.includes(key)) return emoji;
  }
  
  // TODO: 当index为5时（大米图片），替换为用户上传的单个米粒图片
  if (imageDesc.includes('大米') && index === 5) {
    return '/assets/images/rice-grain.jpg'; // 单个米粒图片
  }
  
  return `https://picsum.photos/id/${100 + index}/200/200`;
}

export const CURRENT_LESSON: Lesson = {
  id: 'lesson-101',
  title: 'C- Lingo AI Class Level 1',
  subtitle: '日常主食与饮品',
  videoUrl: 'https://picsum.photos/id/400/400/250',
  videoDuration: '00:45',
  hskLevel: 1,
  cultureVideo: {
    id: 'cult-01',
    title: '中国家庭礼仪',
    thumbnailUrl: 'https://picsum.photos/id/200/400/250',
    videoUrl: 'mock-culture-video',
    unlockThreshold: 2
  },
  units: [
    {
      id: 'unit-1',
      title: 'Unit 1: 日常主食',
      description: '学习米饭、饺子、包子等主食',
      learnings: [
        {
          id: 'l1-v1',
          type: 'vocab',
          content: '米饭',
          pinyin: 'mǐfàn',
          meaning: 'Rice',
          // TODO: 替换为用户上传的蓝色碗装米饭图片
          imageUrl: '/assets/images/rice-bowl-blue.jpg' // 蓝色碗装米饭图片
        },
        {
          id: 'l1-v2',
          type: 'vocab',
          content: '饺子',
          pinyin: 'jiǎozi',
          meaning: 'Dumplings',
          imageUrl: 'https://picsum.photos/id/1004/300/300'
        },
        {
          id: 'l1-v3',
          type: 'vocab',
          content: '包子',
          pinyin: 'bāozi',
          meaning: 'Steamed bun',
          imageUrl: 'https://picsum.photos/id/1/300/300'
        },
        {
          id: 'l1-s1',
          type: 'sentence',
          content: '这是米饭。',
          pinyin: 'Zhè shì mǐfàn.',
          meaning: 'This is rice.',
        }
      ],
      questions: [
        {
          id: '1010101',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['包子', '饺子', '面条', '米饭'],
          imageUrls: [
            getImageUrl('包子', 1),
            getImageUrl('饺子', 2),
            getImageUrl('面条', 3),
            getImageUrl('米饭', 4)
          ],
          correctAnswer: '米饭',
          audioUrl: 'mock-audio-rice',
          difficulty: '⭐',
          explanation: '米饭 (mǐfàn) 是中国人最常吃的主食。'
        },
        {
          id: '1010102',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['米', '饺', '水', '茶'],
          imageUrls: [getImageUrl('大米', 5)],
          correctAnswer: '米',
          difficulty: '⭐',
          explanation: '米 (mǐ) 是米饭的组成部分。'
        },
        {
          id: '1010103',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: '选择正确的英文翻译',
          options: ['Water', 'Noodles', 'Dumplings', 'Rice'],
          imageUrls: [getImageUrl('米饭', 6)],
          chineseText: '米饭',
          pinyin: 'mǐfàn',
          correctAnswer: 'Rice',
          difficulty: '⭐⭐',
          partOfSpeech: 'noun',
          explanation: '米饭的英文翻译是 Rice。'
        },
        {
          id: '1010104',
          type: ExerciseType.T01_PICTURE_FILL_IN,
          prompt: '看图片，选择正确汉字',
          imageEmoji: '🍚',
          correctAnswer: '米饭',
          difficulty: '⭐',
          explanation: '图片显示的是米饭 (mǐfàn)。'
        },
        {
          id: '1010105',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: '选择正确的中文翻译',
          options: ['我吃米饭。', '这是米饭。', '我有米饭。', '米饭好吃。'],
          englishText: 'This is rice.',
          correctAnswer: '这是米饭。',
          difficulty: '⭐⭐',
          explanation: 'This is rice. 翻译为"这是米饭。"'
        },
        {
          id: '1010201',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['包子', '米饭', '饺子', '面条'],
          imageUrls: [
            getImageUrl('包子', 7),
            getImageUrl('米饭', 8),
            getImageUrl('饺子', 9),
            getImageUrl('面条', 10)
          ],
          correctAnswer: '饺子',
          audioUrl: 'mock-audio-dumplings',
          difficulty: '⭐',
          explanation: '饺子 (jiǎozi) 是中国传统食物。'
        },
        {
          id: '1010202',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['米', '喝', '饺', '吃'],
          imageUrls: [getImageUrl('饺子', 11)],
          correctAnswer: '饺',
          difficulty: '⭐',
          explanation: '饺 (jiǎo) 是饺子的组成部分。'
        },
        {
          id: '1010203',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '根据英文，选择正确的图片和汉字',
          options: ['包子 bāozi 包子', '饺子 jiǎozi 饺子', '米饭 mǐfàn 米饭', '面条 miàntiáo 面条'],
          imageUrls: [
            getImageUrl('包子', 12),
            getImageUrl('饺子', 13),
            getImageUrl('米饭', 14),
            getImageUrl('面条', 15)
          ],
          englishText: 'Dumplings',
          correctAnswer: '饺子 jiǎozi 饺子',
          difficulty: '⭐⭐',
          explanation: 'Dumplings 对应的是饺子。'
        },
        {
          id: '1010204',
          type: ExerciseType.T01_PICTURE_FILL_IN,
          prompt: '看图片，选择正确汉字',
          imageEmoji: '🥟',
          correctAnswer: '饺子',
          difficulty: '⭐',
          explanation: '图片显示的是饺子 (jiǎozi)。'
        },
        {
          id: '1010301',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['包子', '面条', '饺子', '米饭'],
          imageUrls: [
            getImageUrl('包子', 15),
            getImageUrl('面条', 16),
            getImageUrl('饺子', 17),
            getImageUrl('米饭', 18)
          ],
          correctAnswer: '包子',
          audioUrl: 'mock-audio-bun',
          difficulty: '⭐',
          explanation: '包子 (bāozi) 是中国的传统面食。'
        },
        {
          id: '1010302',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['喝', '有', '吃', '是'],
          imageUrls: [getImageUrl('吃东西', 19)],
          correctAnswer: '吃',
          difficulty: '⭐',
          explanation: '吃 (chī) 表示进食的动作。'
        },
        {
          id: '1010303',
          type: ExerciseType.T03_LISTEN_SELECT_SENTENCE,
          prompt: '听音频，选择你听到的句子',
          options: ['我吃饺子。', '我吃米饭。', '我喝水。', '我吃包子。'],
          correctAnswer: '我吃包子。',
          audioUrl: 'mock-audio-i-eat-bun',
          difficulty: '⭐⭐',
          explanation: '我吃包子 (Wǒ chī bāozi) 表示"我吃包子"的意思。'
        },
        {
          id: '1010304',
          type: ExerciseType.T01_PICTURE_FILL_IN,
          prompt: '看图片，选择正确汉字',
          imageEmoji: '🍞',
          correctAnswer: '包子',
          difficulty: '⭐',
          explanation: '图片显示的是包子 (bāozi)。'
        }
      ]
    },
    {
      id: 'unit-2',
      title: 'Unit 2: 日常饮品',
      description: '学习水、茶、牛奶等饮品',
      learnings: [
        {
          id: 'l2-h1',
          type: 'hanzi',
          content: '水',
          pinyin: 'shuǐ',
          meaning: 'Water',
          imageUrl: 'https://picsum.photos/id/1004/300/300'
        },
        {
          id: 'l2-h2',
          type: 'hanzi',
          content: '茶',
          pinyin: 'chá',
          meaning: 'Tea',
          imageUrl: 'https://picsum.photos/id/1/300/300'
        },
        {
          id: 'l2-v3',
          type: 'vocab',
          content: '牛奶',
          pinyin: 'niúnǎi',
          meaning: 'Milk',
          imageUrl: 'https://picsum.photos/id/2/300/300'
        },
        {
          id: 'l2-s1',
          type: 'sentence',
          content: '我喝茶。',
          pinyin: 'Wǒ hē chá.',
          meaning: 'I drink tea.',
        }
      ],
      questions: [
        {
          id: '1020101',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['牛奶', '米饭', '茶', '水'],
          imageUrls: [
            getImageUrl('牛奶', 20),
            getImageUrl('米饭', 21),
            getImageUrl('茶', 22),
            getImageUrl('水', 23)
          ],
          correctAnswer: '水',
          audioUrl: 'mock-audio-water',
          difficulty: '⭐',
          explanation: '水 (shuǐ) 是最基本的饮品。'
        },
        {
          id: '1020102',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['米', '茶', '水', '吃'],
          imageUrls: [getImageUrl('水', 24)],
          correctAnswer: '水',
          difficulty: '⭐',
          explanation: '水 (shuǐ) 是生命之源。'
        },
        {
          id: '1020103',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: '选择正确的英文翻译',
          options: ['Milk', 'Tea cup', 'Rice', 'Water cup'],
          imageUrls: [getImageUrl('水杯', 25)],
          chineseText: '水杯',
          pinyin: 'shuǐbēi',
          correctAnswer: 'Water cup',
          difficulty: '⭐⭐',
          explanation: '水杯的英文翻译是 Water cup。'
        },
        {
          id: '1020201',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['牛奶', '水', '茶', '饺子'],
          imageUrls: [
            getImageUrl('牛奶', 26),
            getImageUrl('水', 27),
            getImageUrl('茶', 28),
            getImageUrl('饺子', 29)
          ],
          correctAnswer: '茶',
          audioUrl: 'mock-audio-tea',
          difficulty: '⭐',
          explanation: '茶 (chá) 是中国的传统饮品。'
        },
        {
          id: '1020202',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['吃', '喝', '水', '茶'],
          imageUrls: [getImageUrl('茶', 30)],
          correctAnswer: '茶',
          difficulty: '⭐',
          explanation: '茶 (chá) 是中国文化的重要组成部分。'
        },
        {
          id: '1020203',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '根据英文，选择正确的图片和汉字',
          options: ['茶叶 cháyè 茶叶', '牛奶 niúnǎi 牛奶', '水杯 shuǐbēi 水杯'],
          imageUrls: [
            getImageUrl('茶叶', 31),
            getImageUrl('牛奶', 32),
            getImageUrl('水杯', 33)
          ],
          englishText: 'Tea leaves',
          correctAnswer: '茶叶 cháyè 茶叶',
          difficulty: '⭐⭐',
          explanation: 'Tea leaves 对应的是茶叶。'
        },
        {
          id: '1020301',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['牛奶', '包子', '茶', '水'],
          imageUrls: [
            getImageUrl('牛奶', 34),
            getImageUrl('包子', 35),
            getImageUrl('茶', 36),
            getImageUrl('水', 37)
          ],
          correctAnswer: '牛奶',
          audioUrl: 'mock-audio-milk',
          difficulty: '⭐',
          explanation: '牛奶 (niúnǎi) 是营养丰富的饮品。'
        },
        {
          id: '1020302',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['是', '有', '吃', '喝'],
          imageUrls: [getImageUrl('喝水', 38)],
          correctAnswer: '喝',
          difficulty: '⭐',
          explanation: '喝 (hē) 表示饮用的动作。'
        },
        {
          id: '1020303',
          type: ExerciseType.T03_LISTEN_SELECT_SENTENCE,
          prompt: '听音频，选择你听到的句子',
          options: ['我吃饺子。', '我喝水。', '我喝牛奶。', '我喝茶。'],
          correctAnswer: '我喝牛奶。',
          audioUrl: 'mock-audio-i-drink-milk',
          difficulty: '⭐⭐',
          explanation: '我喝牛奶 (Wǒ hē niúnǎi) 表示"我喝牛奶"的意思。'
        }
      ]
    },
    {
      id: 'unit-3',
      title: 'Unit 3: 这是什么？',
      description: '学习"这是"和"这不是"的表达',
      learnings: [
        {
          id: 'l3-h1',
          type: 'hanzi',
          content: '这',
          pinyin: 'zhè',
          meaning: 'This',
        },
        {
          id: 'l3-h2',
          type: 'hanzi',
          content: '是',
          pinyin: 'shì',
          meaning: 'Is / to be',
        },
        {
          id: 'l3-h3',
          type: 'hanzi',
          content: '不',
          pinyin: 'bù',
          meaning: 'Not',
        },
        {
          id: 'l3-s1',
          type: 'sentence',
          content: '这是包子。',
          pinyin: 'Zhè shì bāozi.',
          meaning: 'This is a steamed bun.',
        }
      ],
      questions: [
        {
          id: '1030101',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['米饭', '面条', '饺子', '包子'],
          imageUrls: [
            getImageUrl('米饭', 39),
            getImageUrl('面条', 40),
            getImageUrl('饺子', 41),
            getImageUrl('包子', 42)
          ],
          correctAnswer: '面条',
          audioUrl: 'mock-audio-noodles',
          difficulty: '⭐',
          explanation: '面条 (miàntiáo) 是常见的主食。'
        },
        {
          id: '1030102',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['这', '是', '我', '不'],
          imageUrls: [getImageUrl('指示', 43)],
          correctAnswer: '这',
          difficulty: '⭐',
          explanation: '这 (zhè) 表示"这个"的意思。'
        },
        {
          id: '1030103',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: '选择正确的中文翻译',
          options: ['我吃面条。', '这是面条。', '这是米饭。', '这是饺子。'],
          englishText: 'This is noodles.',
          correctAnswer: '这是面条。',
          difficulty: '⭐⭐',
          explanation: 'This is noodles. 翻译为"这是面条。"'
        },
        {
          id: '1030201',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['面条', '包子', '米饭', '饺子'],
          imageUrls: [
            getImageUrl('面条', 44),
            getImageUrl('包子', 45),
            getImageUrl('米饭', 46),
            getImageUrl('饺子', 47)
          ],
          correctAnswer: '饺子',
          audioUrl: 'mock-audio-this-is-dumplings',
          difficulty: '⭐',
          explanation: '这是饺子 (Zhè shì jiǎozi) 表示"这是饺子"。'
        },
        {
          id: '1030202',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['这', '是', '不', '有'],
          imageUrls: [getImageUrl('等号', 48)],
          correctAnswer: '是',
          difficulty: '⭐',
          explanation: '是 (shì) 表示"是"的意思。'
        },
        {
          id: '1030203',
          type: ExerciseType.T03_LISTEN_SELECT_SENTENCE,
          prompt: '听音频，选择你听到的句子',
          options: ['这是面条。', '这是饺子。', '我吃饺子。', '这是米饭。'],
          correctAnswer: '这是饺子。',
          audioUrl: 'mock-audio-this-is-dumplings',
          difficulty: '⭐⭐',
          explanation: '这是饺子 (Zhè shì jiǎozi) 表示"这是饺子"。'
        },
        {
          id: '1030301',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['饺子', '米饭', '面包', '面条'],
          imageUrls: [
            getImageUrl('饺子', 49),
            getImageUrl('米饭', 50),
            getImageUrl('面包', 51),
            getImageUrl('面条', 52)
          ],
          correctAnswer: '面包',
          audioUrl: 'mock-audio-bread',
          difficulty: '⭐',
          explanation: '面包 (miànbāo) 是西式主食。'
        },
        {
          id: '1030302',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['不', '是', '有', '这'],
          imageUrls: [getImageUrl('禁止', 53)],
          correctAnswer: '不',
          difficulty: '⭐',
          explanation: '不 (bù) 表示否定。'
        },
        {
          id: '1030303',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: '选择正确的中文翻译',
          options: ['这是面条。', '这是面包。', '这不是面包。', '我吃面包。'],
          englishText: 'This is not bread.',
          correctAnswer: '这不是面包。',
          difficulty: '⭐⭐',
          explanation: 'This is not bread. 翻译为"这不是面包。"'
        }
      ]
    },
    {
      id: 'unit-4',
      title: 'Unit 4: 自我介绍',
      description: '学习"我"、"叫"、"是"等自我介绍用语',
      learnings: [
        {
          id: 'l4-h1',
          type: 'hanzi',
          content: '我',
          pinyin: 'wǒ',
          meaning: 'I / me',
        },
        {
          id: 'l4-h2',
          type: 'hanzi',
          content: '叫',
          pinyin: 'jiào',
          meaning: 'Called / named',
        },
        {
          id: 'l4-v3',
          type: 'vocab',
          content: '学生',
          pinyin: 'xuéshēng',
          meaning: 'Student',
        },
        {
          id: 'l4-s1',
          type: 'sentence',
          content: '我是学生。',
          pinyin: 'Wǒ shì xuéshēng.',
          meaning: 'I am a student.',
        }
      ],
      questions: [
        {
          id: '1040101',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['你', '我', '他', '她'],
          imageUrls: [getImageUrl('指自己', 54)],
          correctAnswer: '我',
          difficulty: '⭐',
          explanation: '我 (wǒ) 表示第一人称。'
        },
        {
          id: '1040102',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['吃饭', '学习', '说话', '喝水'],
          imageUrls: [
            getImageUrl('吃饭', 55),
            getImageUrl('学习', 56),
            getImageUrl('说话', 57),
            getImageUrl('喝水', 58)
          ],
          correctAnswer: '说话',
          audioUrl: 'mock-audio-call',
          difficulty: '⭐',
          explanation: '叫 (jiào) 表示"称呼"的意思。'
        },
        {
          id: '1040103',
          type: ExerciseType.T03_LISTEN_SELECT_SENTENCE,
          prompt: '听音频，选择你听到的句子',
          options: ['我叫小明。', '我吃饺子。', '我是学生。', '我喝水。'],
          correctAnswer: '我叫小明。',
          audioUrl: 'mock-audio-my-name-is-xiaoming',
          difficulty: '⭐⭐',
          explanation: '我叫小明 (Wǒ jiào Xiǎomíng) 表示"我的名字是小明"。'
        },
        {
          id: '1040201',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['我', '是', '学', '人'],
          imageUrls: [getImageUrl('学习', 59)],
          correctAnswer: '学',
          difficulty: '⭐',
          explanation: '学 (xué) 表示"学习"的意思。'
        },
        {
          id: '1040202',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: '选择正确的英文翻译',
          options: ['Chinese', 'Person', 'Teacher', 'Student'],
          imageUrls: [getImageUrl('学生', 60)],
          chineseText: '学生',
          pinyin: 'xuéshēng',
          correctAnswer: 'Student',
          difficulty: '⭐⭐',
          explanation: '学生的英文翻译是 Student。'
        },
        {
          id: '1040203',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: '选择正确的中文翻译',
          options: ['我不是学生。', '我是学生。', '这是学生。', '我叫学生。'],
          englishText: 'I am a student.',
          correctAnswer: '我是学生。',
          difficulty: '⭐⭐',
          explanation: 'I am a student. 翻译为"我是学生。"'
        },
        {
          id: '1040301',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['人', '学', '是', '我'],
          imageUrls: [getImageUrl('人物', 61)],
          correctAnswer: '人',
          difficulty: '⭐',
          explanation: '人 (rén) 表示"人"的意思。'
        },
        {
          id: '1040302',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: '选择正确的英文翻译',
          options: ['Teacher', 'Student', 'American', 'Chinese person'],
          imageUrls: [getImageUrl('中国人', 62)],
          chineseText: '中国人',
          pinyin: 'zhōngguórén',
          correctAnswer: 'Chinese person',
          difficulty: '⭐⭐',
          explanation: '中国人的英文翻译是 Chinese person。'
        },
        {
          id: '1040303',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: '选择正确的中文翻译',
          options: ['我是中国人。', '我不是中国人。', '这是中国人。', '我叫中国人。'],
          englishText: 'I am not Chinese.',
          correctAnswer: '我不是中国人。',
          difficulty: '⭐⭐',
          explanation: 'I am not Chinese. 翻译为"我不是中国人。"'
        }
      ]
    },
    {
      id: 'unit-5',
      title: 'Unit 5: 我的宠物',
      description: '学习"这"、"谁"、"有"等表达',
      learnings: [
        {
          id: 'l5-h1',
          type: 'hanzi',
          content: '猫',
          pinyin: 'māo',
          meaning: 'Cat',
        },
        {
          id: 'l5-h2',
          type: 'hanzi',
          content: '狗',
          pinyin: 'gǒu',
          meaning: 'Dog',
        },
        {
          id: 'l5-h3',
          type: 'hanzi',
          content: '谁',
          pinyin: 'shéi',
          meaning: 'Who',
        },
        {
          id: 'l5-s1',
          type: 'sentence',
          content: '这是我的猫。',
          pinyin: 'Zhè shì wǒ de māo.',
          meaning: 'This is my cat.',
        }
      ],
      questions: [
        {
          id: '1050101',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['猫', '饺子', '狗', '水'],
          imageUrls: [
            getImageUrl('猫', 63),
            getImageUrl('饺子', 64),
            getImageUrl('狗', 65),
            getImageUrl('水', 66)
          ],
          correctAnswer: '猫',
          audioUrl: 'mock-audio-cat',
          difficulty: '⭐',
          explanation: '猫 (māo) 是常见的宠物。'
        },
        {
          id: '1050102',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['有', '狗', '谁', '猫'],
          imageUrls: [getImageUrl('猫', 67)],
          correctAnswer: '猫',
          difficulty: '⭐',
          explanation: '猫 (māo) 是可爱的动物。'
        },
        {
          id: '1050103',
          type: ExerciseType.T03_LISTEN_SELECT_SENTENCE,
          prompt: '听音频，选择你听到的句子',
          options: ['这是我的狗。', '谁的猫？', '这是我的猫。', '我有猫。'],
          correctAnswer: '这是我的猫。',
          audioUrl: 'mock-audio-this-is-my-cat',
          difficulty: '⭐⭐',
          explanation: '这是我的猫 (Zhè shì wǒ de māo) 表示"这是我的猫"。'
        },
        {
          id: '1050201',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['茶', '猫', '狗', '水'],
          imageUrls: [
            getImageUrl('茶', 68),
            getImageUrl('猫', 69),
            getImageUrl('狗', 70),
            getImageUrl('水', 71)
          ],
          correctAnswer: '狗',
          audioUrl: 'mock-audio-dog',
          difficulty: '⭐',
          explanation: '狗 (gǒu) 是人类的好朋友。'
        },
        {
          id: '1050202',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['他', '你', '谁', '我'],
          imageUrls: [getImageUrl('问号人物', 72)],
          correctAnswer: '谁',
          difficulty: '⭐',
          explanation: '谁 (shéi) 表示疑问"谁"。'
        },
        {
          id: '1050203',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: '选择正确的中文翻译',
          options: ['我有狗。', '这是狗。', '这是谁的狗？', '这是我的狗。'],
          englishText: 'Whose dog is this?',
          correctAnswer: '这是谁的狗？',
          difficulty: '⭐⭐',
          explanation: 'Whose dog is this? 翻译为"这是谁的狗？"'
        },
        {
          id: '1050301',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['是', '有', '吃', '喝'],
          imageUrls: [getImageUrl('拥有', 73)],
          correctAnswer: '有',
          difficulty: '⭐',
          explanation: '有 (yǒu) 表示"拥有"的意思。'
        },
        {
          id: '1050302',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: '选择正确的英文翻译',
          options: ['Three (animals)', 'Two (animals)', 'One (animal)', 'Many'],
          imageUrls: [getImageUrl('三只猫', 74)],
          chineseText: '三只',
          pinyin: 'sānzhī',
          correctAnswer: 'Three (animals)',
          difficulty: '⭐⭐',
          explanation: '三只的英文翻译是 Three (animals)。'
        },
        {
          id: '1050303',
          type: ExerciseType.T03_LISTEN_SELECT_SENTENCE,
          prompt: '听音频，选择你听到的句子',
          options: ['这是我的猫。', '谁的猫？', '我有三只狗。', '我有三只猫。'],
          correctAnswer: '我有三只猫。',
          audioUrl: 'mock-audio-i-have-three-cats',
          difficulty: '⭐⭐',
          explanation: '我有三只猫 (Wǒ yǒu sān zhī māo) 表示"我有三只猫"。'
        }
      ]
    },
    {
      id: 'unit-6',
      title: 'Unit 6: 家庭成员',
      description: '学习"他"、"她"、"爸爸"、"妈妈"等家庭成员',
      learnings: [
        {
          id: 'l6-h1',
          type: 'hanzi',
          content: '他',
          pinyin: 'tā',
          meaning: 'He',
        },
        {
          id: 'l6-h2',
          type: 'hanzi',
          content: '她',
          pinyin: 'tā',
          meaning: 'She',
        },
        {
          id: 'l6-v3',
          type: 'vocab',
          content: '爸爸',
          pinyin: 'bàba',
          meaning: 'Dad',
        },
        {
          id: 'l6-v4',
          type: 'vocab',
          content: '妈妈',
          pinyin: 'māma',
          meaning: 'Mom',
        },
        {
          id: 'l6-s1',
          type: 'sentence',
          content: '她是我的妈妈。',
          pinyin: 'Tā shì wǒ de māma.',
          meaning: 'She is my mom.',
        }
      ],
      questions: [
        {
          id: '1060101',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['她', '他', '你', '我'],
          imageUrls: [getImageUrl('男性', 75)],
          correctAnswer: '他',
          difficulty: '⭐',
          explanation: '他 (tā) 表示第三人称男性。'
        },
        {
          id: '1060102',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['爸爸', '学生', '狗', '妈妈'],
          imageUrls: [
            getImageUrl('爸爸', 76),
            getImageUrl('学生', 77),
            getImageUrl('狗', 78),
            getImageUrl('妈妈', 79)
          ],
          correctAnswer: '爸爸',
          audioUrl: 'mock-audio-dad',
          difficulty: '⭐',
          explanation: '爸爸 (bàba) 是父亲的意思。'
        },
        {
          id: '1060103',
          type: ExerciseType.T04_WORD_MEANING_SELECT,
          prompt: '选择正确的英文翻译',
          options: ['Dad/Father', 'Teacher', 'Student', 'Mom/Mother'],
          imageUrls: [getImageUrl('爸爸', 80)],
          chineseText: '爸爸',
          pinyin: 'bàba',
          correctAnswer: 'Dad/Father',
          difficulty: '⭐⭐',
          explanation: '爸爸的英文翻译是 Dad/Father。'
        },
        {
          id: '1060201',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['他', '她', '你', '我'],
          imageUrls: [getImageUrl('女性', 81)],
          correctAnswer: '她',
          difficulty: '⭐',
          explanation: '她 (tā) 表示第三人称女性。'
        },
        {
          id: '1060202',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['爸爸', '妈妈', '猫', '学生'],
          imageUrls: [
            getImageUrl('爸爸', 82),
            getImageUrl('妈妈', 83),
            getImageUrl('猫', 84),
            getImageUrl('学生', 85)
          ],
          correctAnswer: '妈妈',
          audioUrl: 'mock-audio-mom',
          difficulty: '⭐',
          explanation: '妈妈 (māma) 是母亲的意思。'
        },
        {
          id: '1060203',
          type: ExerciseType.T03_LISTEN_SELECT_SENTENCE,
          prompt: '听音频，选择你听到的句子',
          options: ['这是她的爸爸。', '这是他的妈妈。', '这是我的妈妈。', '这是她的妈妈。'],
          correctAnswer: '这是她的妈妈。',
          audioUrl: 'mock-audio-this-is-her-mom',
          difficulty: '⭐⭐',
          explanation: '这是她的妈妈 (Zhè shì tā de māma) 表示"这是她的妈妈"。'
        },
        {
          id: '1060301',
          type: ExerciseType.T02_PICTURE_SELECT_TEXT,
          prompt: '看图片，选择正确汉字',
          options: ['我', '他', '你', '她'],
          imageUrls: [getImageUrl('指向对方', 86)],
          correctAnswer: '你',
          difficulty: '⭐',
          explanation: '你 (nǐ) 表示第二人称。'
        },
        {
          id: '1060302',
          type: ExerciseType.T00_LISTEN_SELECT_IMAGE,
          prompt: '听音频，选择正确图片',
          options: ['猫', '饭店', '学校', '家'],
          imageUrls: [
            getImageUrl('猫', 87),
            getImageUrl('饭店', 88),
            getImageUrl('学校', 89),
            getImageUrl('家', 90)
          ],
          correctAnswer: '家',
          audioUrl: 'mock-audio-home',
          difficulty: '⭐',
          explanation: '家 (jiā) 表示"家庭"的意思。'
        },
        {
          id: '1060303',
          type: ExerciseType.T05_GRAMMAR_SELECT,
          prompt: '选择正确的中文翻译',
          options: ['我家有三口人。', '这是你的家。', '你是谁？', '你家几口人？'],
          englishText: 'How many people are in your family?',
          correctAnswer: '你家几口人？',
          difficulty: '⭐⭐',
          explanation: 'How many people are in your family? 翻译为"你家几口人？"'
        }
      ]
    }
  ]
};

