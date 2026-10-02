import { Ionicons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getAnswer } from '../services/aiAssistant';
import { fonts, useAppTheme } from '../theme/tokens';

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

const SUGGESTIONS = [
  'Which site is unsafe right now?',
  "How's the Canteen trending?",
  'Which cooler has the best reading?',
] as const;

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome',
    role: 'assistant',
    text: 'Hello — I can help make sense of the latest water-quality readings across campus. What would you like to know?',
  },
];

export function AssistantScreen() {
  const theme = useAppTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const horizontalPadding = width >= 700 ? 32 : 18;

  async function sendQuestion(rawQuestion: string) {
    const question = rawQuestion.trim();
    if (!question || sending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: question,
    };
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setSending(true);

    try {
      const answer = await getAnswer(question);
      setMessages((current) => [
        ...current,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: answer },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: 'I could not read the latest site data just now. Please try again.',
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
          <View style={[styles.assistantIcon, { backgroundColor: theme.sunken }]}>
            <Ionicons name="sparkles" color={theme.brand} size={20} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={[styles.title, { color: theme.text }]}>Water assistant</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>Answers from current campus readings</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.messages,
            { paddingHorizontal: horizontalPadding, width: '100%', maxWidth: 784 },
          ]}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map((message) => {
            const isUser = message.role === 'user';
            return (
              <View
                key={message.id}
                style={[
                  styles.bubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                  {
                    backgroundColor: isUser ? theme.brand : theme.surface,
                    borderColor: isUser ? theme.brand : theme.border,
                  },
                ]}
              >
                <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : theme.text }]}>
                  {message.text}
                </Text>
              </View>
            );
          })}
          {sending ? (
            <View style={[styles.typingBubble, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.typingDot, { backgroundColor: theme.faint }]} />
              <View style={[styles.typingDot, { backgroundColor: theme.faint }]} />
              <View style={[styles.typingDot, { backgroundColor: theme.faint }]} />
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.composerArea, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.suggestions, { paddingHorizontal: horizontalPadding }]}
            keyboardShouldPersistTaps="handled"
          >
            {SUGGESTIONS.map((suggestion) => (
              <Pressable
                key={suggestion}
                disabled={sending}
                onPress={() => void sendQuestion(suggestion)}
                style={({ pressed }) => [
                  styles.suggestion,
                  { backgroundColor: theme.sunken, borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.suggestionText, { color: theme.muted }]}>{suggestion}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={[styles.composer, { marginHorizontal: horizontalPadding }]}>
            <TextInput
              accessibilityLabel="Ask the water assistant"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={() => void sendQuestion(input)}
              placeholder="Ask about a site or reading…"
              placeholderTextColor={theme.faint}
              returnKeyType="send"
              style={[
                styles.input,
                { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text },
              ]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send question"
              disabled={!input.trim() || sending}
              onPress={() => void sendQuestion(input)}
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor: input.trim() && !sending ? theme.brandStrong : theme.sunken,
                  opacity: pressed ? 0.75 : 1,
                },
              ]}
            >
              <Ionicons
                name="arrow-up"
                color={input.trim() && !sending ? theme.background : theme.faint}
                size={20}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 18,
    paddingBottom: 14,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 784,
  },
  assistantIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, gap: 2 },
  title: { fontFamily: fonts.display, fontSize: 27 },
  subtitle: { fontFamily: fonts.body, fontSize: 12 },
  messages: { flexGrow: 1, alignSelf: 'center', gap: 12, paddingTop: 12, paddingBottom: 18 },
  bubble: { borderWidth: 1, maxWidth: '86%', paddingHorizontal: 15, paddingVertical: 12 },
  userBubble: { alignSelf: 'flex-end', borderRadius: 18, borderBottomRightRadius: 5 },
  assistantBubble: { alignSelf: 'flex-start', borderRadius: 18, borderBottomLeftRadius: 5 },
  messageText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  typingBubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 5,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  typingDot: { width: 5, height: 5, borderRadius: 3 },
  composerArea: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, paddingBottom: 10 },
  suggestions: { gap: 8, paddingBottom: 10 },
  suggestion: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  suggestionText: { fontFamily: fonts.bodyMedium, fontSize: 11 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 720,
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 23,
    paddingHorizontal: 16,
    fontFamily: fonts.body,
    fontSize: 14,
  },
  sendButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});


