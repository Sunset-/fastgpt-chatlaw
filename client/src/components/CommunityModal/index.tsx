import React from 'react';
import { Button, ModalFooter, ModalBody } from '@chakra-ui/react';
import MyModal from '../MyModal';
import { useTranslation } from 'react-i18next';
import Markdown from '../Markdown';

// const md = `
// | 交流群 | 小助手 |
// | ----------------------- | -------------------- |
// | ![](https://otnvvf-imgs.oss.laf.run/wxqun300.jpg) | ![](https://otnvvf-imgs.oss.laf.run/wx300.jpg) |
// `;
const md = `
| 法唠AI官方微信 | 法唠AI客服微信 |
| ----------------------- | -------------------- |
| ![](http://18851.com.cn/imgs/chatlaw_authority.jpg) | ![](http://18851.com.cn/imgs/chatlaw_customer_service.png) |
`;

const CommunityModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();
  return (
    <MyModal isOpen={true} onClose={onClose} title={t('home.Community')}>
      <ModalBody textAlign={'center'}>
        <Markdown source={md} />
      </ModalBody>

      <ModalFooter>
        <Button variant={'base'} onClick={onClose}>
          关闭
        </Button>
      </ModalFooter>
    </MyModal>
  );
};

export default CommunityModal;
