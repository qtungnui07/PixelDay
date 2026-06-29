export type TaskStatus = 'done' | 'active' | 'later';
export type TaskPriority = 'Cao' | 'Trung bình' | 'Thấp';
export type TaskScope = 'Ngày' | 'Tuần' | 'Tháng';

export type Task = {
  id: string;
  title: string;
  time: string;
  status: TaskStatus;
  tag: string;
  priority: TaskPriority;
  category: string;
  scope: TaskScope;
};

export type CalendarEvent = {
  id: string;
  title: string;
  time: string;
  color: string;
  startsAt?: string;
  endsAt?: string | null;
  source?: string;
};
