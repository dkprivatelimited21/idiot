// src/components/FeedbackButton.tsx
interface FeedbackButtonProps {
  input: string;
  response: string;
  onFeedback: (correct: boolean) => void;
}

export const FeedbackButton = ({ input, response, onFeedback }: FeedbackButtonProps) => {
  const [givenFeedback, setGivenFeedback] = useState<boolean | null>(null);

  const handleFeedback = (correct: boolean) => {
    setGivenFeedback(correct);
    onFeedback(correct);
    
    // Update learning processor
    const learningProcessor = new LearningProcessor();
    if (!correct) {
      learningProcessor.manualTeach(input, promptForBetterResponse());
    }
  };

  const promptForBetterResponse = (): string => {
    const betterResponse = prompt("How should I have responded?", response);
    return betterResponse || response;
  };

  return (
    <div className="flex gap-2 mt-2">
      <Button
        variant={givenFeedback === true ? "default" : "outline"}
        size="sm"
        onClick={() => handleFeedback(true)}
      >
        <ThumbsUp size={14} />
      </Button>
      <Button
        variant={givenFeedback === false ? "default" : "outline"}
        size="sm"
        onClick={() => handleFeedback(false)}
      >
        <ThumbsDown size={14} />
      </Button>
    </div>
  );
};