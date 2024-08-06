import * as React from 'react';
import Stack from '@mui/joy/Stack';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';
import { Box, Chip, IconButton, Input } from '@mui/joy';
import List from '@mui/joy/List';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChatListItem from './ChatListItem';
import { ChatProps } from '../types';
import { toggleMessagesPane } from '../utils';

// type ChatsPaneProps = {
//   chats; //: ChatProps[]
//   setSelectedChat: (chats: ChatProps) => void;
//   selectedChatId: string;
// };

export default function ChatsPane(props) {
  const { chats, setSelectedChat, selectedChatId, setFriendId, isFetched, isDataPrepared, friendId, prepareConvMessages, enableConversationFetching, setIsConversationFetched, setToggle, toggle} = props;


  function uuidv4() {
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
      (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
    );
  }
  
  return (
    <Sheet
      sx={{
        borderRight: '1px solid',
        borderColor: 'divider',
        height: 'calc(100dvh - 0px)',
        overflowY: 'auto',
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        justifyContent="space-between"
        p={2}
        pb={1.5}
      >
        <Typography
          fontSize={{ xs: 'md', md: 'lg' }}
          component="h1"
          fontWeight="lg"
          endDecorator={
            <Chip
              variant="soft"
              color="primary"
              size="md"
              slotProps={{ root: { component: 'span' } }}
            >
              4
            </Chip>
          }
          sx={{ mr: 'auto' }}
        >
          Messages
        </Typography>
        <IconButton
          variant="plain"
          aria-label="edit"
          color="neutral"
          size="sm"
          sx={{ display: { xs: 'none', sm: 'unset' } }}
        >
          <EditNoteRoundedIcon />
        </IconButton>
        <IconButton
          variant="plain"
          aria-label="edit"
          color="neutral"
          size="sm"
          onClick={() => {
            toggleMessagesPane();
          }}
          sx={{ display: { sm: 'none' } }}
        >
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Input
          size="sm"
          startDecorator={<SearchRoundedIcon />}
          placeholder="Search"
          aria-label="Search"
        />
      </Box>
      <List
        sx={{
          py: 0,
          '--ListItem-paddingY': '0.75rem',
          '--ListItem-paddingX': '1rem',
        }}
      >
        {chats?.map((chat) => (
          <ChatListItem
            isFetched={isFetched}
            isDataPrepared={isDataPrepared}
            key={uuidv4()}
            {...chat}
            setSelectedChat={setSelectedChat}
            selectedChatId={selectedChatId}
            setFriendId={setFriendId}
            friendId={friendId}
            enableConversationFetching = {enableConversationFetching}
            setIsConversationFetched={setIsConversationFetched}
            setToggle={setToggle}
            toggle={toggle}
          />
        )) }
      </List>
    </Sheet>
  );
}