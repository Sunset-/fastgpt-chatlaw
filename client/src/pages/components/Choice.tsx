import { Box, Image, Flex, Grid, useTheme } from '@chakra-ui/react';
import React, { useRef } from 'react';
import { useTranslation } from 'next-i18next';
import MyTooltip from '@/components/MyTooltip';
import MyIcon from '@/components/Icon';

const Choice = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const list = [
    {
      icon: '/imgs/home/wdsz.png',
      title: t('home.Choice Open'),
      desc: t('home.Choice Open Desc'),
      tooltip: '前往 GitHub',
      onClick: () => window.open('https://github.com/labring/FastGPT', '_blank')
    },
    {
      icon: '/imgs/home/mnpj.png',
      title: t('home.Choice QA'),
      desc: t('home.Choice QA Desc'),
      onClick: () => {}
    },
    {
      icon: '/imgs/home/ipo.png',
      title: t('home.Choice Visual'),
      desc: t('home.Choice Visual Desc'),
      onClick: () => {}
    },
    {
      icon: '/imgs/home/scdfh.png',
      title: t('home.Choice Extension'),
      desc: t('home.Choice Extension Desc'),
      onClick: () => {}
    },
    {
      icon: '/imgs/home/sclsh.png',
      title: t('home.Choice Debug'),
      desc: t('home.Choice Debug Desc'),
      onClick: () => {}
    },
    {
      icon: '/imgs/home/gfhts.png',
      title: t('home.Choice Models'),
      desc: t('home.Choice Models Desc'),
      onClick: () => {}
    }
  ];

  return (
    <Box>
      <Box
        className="textlg"
        py={['30px', '60px']}
        textAlign={'center'}
        fontSize={['22px', '30px']}
        fontWeight={'bold'}
      >
        {t('home.Why FastGPT')}
      </Box>
      <Grid px={[5, 0]} gridTemplateColumns={['1fr', `1fr 1fr`, 'repeat(3,1fr)']} gridGap={6}>
        {list.map((item) => (
          <MyTooltip key={item.title} label={item.tooltip}>
            <Flex
              alignItems={'flex-start'}
              border={theme.borders.md}
              borderRadius={'lg'}
              p={'40px'}
              transition={'0.1s'}
              cursor={'default'}
              _hover={{
                bg: 'rgba(255,255,255,0.8)'
              }}
              onClick={item.onClick}
            >
              <Flex
                flex={'0 0 48px'}
                h={'48px'}
                alignItems={'center'}
                justifyContent={'center'}
                boxShadow={theme.shadows.base}
                borderRadius={'14px'}
              >
                <Image src={item.icon} w={'28px'} alt={''} />
              </Flex>
              <Box ml={5}>
                <Box fontSize={['lg', '2xl']} fontWeight={'bold'} color={'myGray.900'}>
                  {item.title}
                </Box>
                <Box mt={1} fontSize={['md', 'lg']}>
                  {item.desc}
                </Box>
              </Box>
            </Flex>
          </MyTooltip>
        ))}
      </Grid>
    </Box>
  );
};

export default Choice;