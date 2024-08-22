import * as React from 'react';
import Box from '@mui/joy/Box';
import ListDivider from '@mui/joy/ListDivider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton, { ListItemButtonProps } from '@mui/joy/ListItemButton';
import Stack from '@mui/joy/Stack';
import Typography from '@mui/joy/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import AvatarWithStatus from './AvatarWithStatus';
import { ChatProps, MessageProps, UserProps } from '../types';
import { toggleMessagesPane } from '../utils';

// type ChatListItemProps = ListItemButtonProps & {
//   id: string;
//   unread?: boolean;
//   sender: UserProps;
//   messages: MessageProps[];
//   selectedChatId?: string;
//   setSelectedChat: (chat: ChatProps) => void;
// };

export default function ChatListItem(props) {
  const { id, sender, messages, selectedChatId, setSelectedChat, setFriendId, setIsConversationFetched, setToggle, toggle} = props;
  const selected = selectedChatId === id;
  let handleClick = () => {
    setToggle(!toggle)
    setIsConversationFetched(true);
    setSelectedChat([{ id, sender, messages }]);
    setFriendId(sender._id);
    toggleMessagesPane();
  }
  console.log(messages[0]?.content)
  return (
    <React.Fragment>
      <ListItem>
        <ListItemButton
          onClick={handleClick}
          selected={selected}
          color="neutral"
          sx={{
            flexDirection: 'column',
            alignItems: 'initial',
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1.5}>
            <AvatarWithStatus online={sender?.online} src={sender?.avatar} />
            <Box sx={{ flex: 1 }}>
              <Typography level="title-sm">{sender?.name}</Typography>
              <Typography level="body-sm">{sender?.username}</Typography>
            </Box>
            <Box
              sx={{
                lineHeight: 1.5,
                textAlign: 'right',
              }}
            >
              {messages[0]?.unread && (
                <CircleIcon sx={{ fontSize: 12 }} color="primary" />
              )}
              <Typography
                level="body-xs"
                display={{ xs: 'none', md: 'block' }}
                noWrap
              >
                5 mins ago
              </Typography>
            </Box>
          </Stack>
          <Typography
            level="body-sm"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {typeof messages[0]?.content !== 'object' && messages[0]?.content.toString()}
          </Typography>
        </ListItemButton>
      </ListItem>
      <ListDivider sx={{ margin: 0 }} />
    </React.Fragment>
  );
}