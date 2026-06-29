import { theme } from '@/constants/theme';
import type { CalendarEvent, Task } from '@/types';

export const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Hoàn thiện wireframe PixelDay',
    time: '09:00',
    status: 'done',
    tag: 'Thiết kế',
    priority: 'Cao',
    category: 'Thiết kế',
    scope: 'Tuần',
  },
  {
    id: '2',
    title: 'Đọc lại kế hoạch tuần',
    time: '11:30',
    status: 'active',
    tag: 'Cá nhân',
    priority: 'Trung bình',
    category: 'Cá nhân',
    scope: 'Tuần',
  },
  {
    id: '3',
    title: 'Chuẩn bị ghi chú họp nhóm',
    time: '15:00',
    status: 'later',
    tag: 'Công việc',
    priority: 'Thấp',
    category: 'Công việc',
    scope: 'Ngày',
  },
];

export const sampleEvents: CalendarEvent[] = [
  { id: '1', title: 'Họp sprint nhẹ nhàng', time: '10:00 - 10:30', color: theme.colors.primary },
  { id: '2', title: 'Đi bộ sau bữa trưa', time: '12:45 - 13:15', color: theme.colors.mint },
  { id: '3', title: 'Tổng kết cuối ngày', time: '20:30 - 20:45', color: theme.colors.peach },
];
