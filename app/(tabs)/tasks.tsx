import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Card, PixelScreen } from '@/components/PixelLayout';
import { theme } from '@/constants/theme';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import type { Task, TaskPriority, TaskScope } from '@/types';

const priorities: TaskPriority[] = ['Cao', 'Trung bình', 'Thấp'];
const scopes: TaskScope[] = ['Ngày', 'Tuần', 'Tháng'];

type TaskForm = {
  title: string;
  time: string;
  priority: TaskPriority;
  category: string;
  scope: TaskScope;
};

const emptyForm: TaskForm = {
  title: '',
  time: '',
  priority: 'Trung bình',
  category: '',
  scope: 'Ngày',
};

const statusCopy = {
  done: 'Xong',
  active: 'Đang làm',
  later: 'Sau',
};

const priorityColors: Record<TaskPriority, { bg: string; text: string }> = {
  Cao: { bg: theme.colors.errorContainer, text: theme.colors.danger },
  'Trung bình': { bg: theme.colors.peach, text: theme.colors.onPeach },
  Thấp: { bg: theme.colors.surfaceContainer, text: theme.colors.muted },
};

export default function TasksScreen() {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedScope, setSelectedScope] = useState<TaskScope>('Tuần');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form, setForm] = useState<TaskForm>(emptyForm);

  useEffect(() => {
    async function loadTasks() {
      if (!token) {
        return;
      }

      try {
        const result = await api.tasks(token);
        setTasks(result.tasks);
      } catch {
        setTasks([]);
      }
    }

    loadTasks();
  }, [token]);

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.scope === selectedScope),
    [selectedScope, tasks]
  );
  const doneCount = visibleTasks.filter((task) => task.status === 'done').length;
  const totalCount = visibleTasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100);

  function updateForm(field: keyof TaskForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function addTask() {
    const title = form.title.trim();

    if (!title || !token) {
      return;
    }

    const category = form.category.trim() || 'Cá nhân';
    const result = await api.createTask(token, {
      title,
      time: form.time.trim() || '--:--',
      priority: form.priority,
      category,
      scope: form.scope,
    });

    setTasks((currentTasks) => [result.task, ...currentTasks]);
    setSelectedScope(form.scope);
    setForm(emptyForm);
    setIsModalVisible(false);
  }

  async function toggleTask(taskId: string) {
    if (!token) {
      return;
    }

    const currentTask = tasks.find((task) => task.id === taskId);
    const nextStatus = currentTask?.status === 'done' ? 'active' : 'done';
    const result = await api.updateTaskStatus(token, taskId, nextStatus);

    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? result.task : task))
    );
  }

  async function deleteTask(taskId: string) {
    if (!token) {
      return;
    }

    await api.deleteTask(token, taskId);
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  }

  return (
    <PixelScreen title="Công việc" subtitle="Một danh sách nhẹ để giữ nhịp ngày.">
      <View style={styles.segmented}>
        {scopes.map((scope) => (
          <Pressable
            key={scope}
            style={[styles.segmentButton, selectedScope === scope && styles.segmentActive]}
            onPress={() => setSelectedScope(scope)}>
            <Text style={[styles.segmentText, selectedScope === scope && styles.segmentTextActive]}>
              {scope}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card style={styles.progressCard}>
        <Text style={styles.progressTitle}>Tiến độ {selectedScope.toLowerCase()}</Text>
        <Text style={styles.progressSub}>
          {totalCount === 0 ? 'Chưa có công việc trong mục này.' : 'Bạn đang làm rất tốt!'}
        </Text>
        <View style={styles.progressRow}>
          <Text style={styles.progressValue}>{progress}%</Text>
          <Text style={styles.progressMeta}>
            {doneCount}/{totalCount} hoàn thành
          </Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${progress}%` }]} />
        </View>
      </Card>

      {visibleTasks.map((task) => {
        const priorityColor = priorityColors[task.priority];

        return (
          <Card key={task.id} style={styles.taskCard}>
            <Pressable style={styles.checkWrap} onPress={() => toggleTask(task.id)}>
              <MaterialCommunityIcons
                color={task.status === 'done' ? theme.colors.onMint : theme.colors.primary}
                name={task.status === 'done' ? 'check-circle' : 'radiobox-blank'}
                size={30}
              />
            </Pressable>
            <View style={styles.taskText}>
              <Text style={[styles.taskTitle, task.status === 'done' && styles.taskDone]}>
                {task.title}
              </Text>
              <Text style={styles.taskMeta}>
                {task.time} · {task.category}
              </Text>
              <View style={styles.chipRow}>
                <Text style={[styles.chip, { backgroundColor: priorityColor.bg, color: priorityColor.text }]}>
                  {task.priority}
                </Text>
                <Text style={styles.chip}>{statusCopy[task.status]}</Text>
              </View>
            </View>
            <Pressable style={styles.deleteButton} onPress={() => deleteTask(task.id)}>
              <MaterialCommunityIcons color={theme.colors.danger} name="trash-can-outline" size={22} />
            </Pressable>
          </Card>
        );
      })}

      <Pressable style={styles.addButton} onPress={() => setIsModalVisible(true)}>
        <MaterialCommunityIcons color={theme.colors.onPrimaryContainer} name="plus" size={24} />
        <Text style={styles.addText}>Thêm công việc</Text>
      </Pressable>

      <Modal animationType="slide" transparent visible={isModalVisible}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Công việc mới</Text>
              <Pressable onPress={() => setIsModalVisible(false)}>
                <MaterialCommunityIcons color={theme.colors.muted} name="close" size={24} />
              </Pressable>
            </View>

            <TextInput
              placeholder="Tên công việc"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              value={form.title}
              onChangeText={(value) => updateForm('title', value)}
            />
            <TextInput
              placeholder="Thời gian, ví dụ 09:00"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              value={form.time}
              onChangeText={(value) => updateForm('time', value)}
            />
            <TextInput
              placeholder="Danh mục"
              placeholderTextColor={theme.colors.muted}
              style={styles.input}
              value={form.category}
              onChangeText={(value) => updateForm('category', value)}
            />

            <Text style={styles.fieldLabel}>Độ ưu tiên</Text>
            <View style={styles.optionRow}>
              {priorities.map((priority) => (
                <Pressable
                  key={priority}
                  style={[styles.option, form.priority === priority && styles.optionActive]}
                  onPress={() => updateForm('priority', priority)}>
                  <Text style={[styles.optionText, form.priority === priority && styles.optionTextActive]}>
                    {priority}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Phạm vi</Text>
            <View style={styles.optionRow}>
              {scopes.map((scope) => (
                <Pressable
                  key={scope}
                  style={[styles.option, form.scope === scope && styles.optionActive]}
                  onPress={() => updateForm('scope', scope)}>
                  <Text style={[styles.optionText, form.scope === scope && styles.optionTextActive]}>
                    {scope}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.saveButton, !form.title.trim() && styles.saveButtonDisabled]}
              onPress={addTask}>
              <Text style={styles.saveText}>Lưu công việc</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </PixelScreen>
  );
}

const styles = StyleSheet.create({
  segmented: {
    backgroundColor: theme.colors.surfaceHigh,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    borderRadius: theme.radius.pill,
    flex: 1,
    paddingVertical: 10,
  },
  segmentActive: {
    backgroundColor: theme.colors.surface,
  },
  segmentText: {
    color: theme.colors.muted,
    fontWeight: '800',
    textAlign: 'center',
  },
  segmentTextActive: {
    color: theme.colors.text,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  progressTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  progressSub: {
    color: theme.colors.muted,
    marginTop: 4,
  },
  progressRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  progressValue: {
    color: theme.colors.primary,
    fontSize: 34,
    fontWeight: '900',
  },
  progressMeta: {
    color: theme.colors.muted,
    fontWeight: '700',
    marginBottom: 6,
  },
  track: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.pill,
    height: 12,
    marginTop: theme.spacing.sm,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radius.pill,
    height: '100%',
  },
  taskCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  checkWrap: {
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 18,
    height: 46,
    justifyContent: 'center',
    width: 46,
  },
  taskText: {
    flex: 1,
    gap: 5,
  },
  taskTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 22,
  },
  taskDone: {
    color: theme.colors.muted,
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.pill,
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  deleteButton: {
    alignItems: 'center',
    borderRadius: theme.radius.pill,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radius.pill,
    flexDirection: 'row',
    gap: theme.spacing.sm,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  addText: {
    color: theme.colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: '900',
  },
  modalBackdrop: {
    backgroundColor: 'rgba(28, 27, 29, 0.32)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    gap: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  input: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    color: theme.colors.text,
    fontSize: 16,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
  },
  fieldLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: '900',
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  option: {
    backgroundColor: theme.colors.surfaceContainer,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: theme.colors.primaryContainer,
  },
  optionText: {
    color: theme.colors.muted,
    fontWeight: '900',
  },
  optionTextActive: {
    color: theme.colors.onPrimaryContainer,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.primaryContainer,
    borderRadius: theme.radius.pill,
    marginTop: theme.spacing.sm,
    paddingVertical: 16,
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveText: {
    color: theme.colors.onPrimaryContainer,
    fontSize: 16,
    fontWeight: '900',
  },
});
