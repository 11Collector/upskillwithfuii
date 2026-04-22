import { questions } from "@/data/librarySoulsQuestions";

export const calculateMBTI = (answers: Record<number, 'A' | 'B' | 'C'>): string => {
  const scores: Record<string, number> = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
  };

  questions.forEach((q) => {
    const answer = answers[q.id];
    if (answer) {
      const optionValue = q.options[answer].value;
      
      if (Array.isArray(optionValue)) {
        optionValue.forEach(val => {
          if (val in scores) {
            scores[val]++;
          }
        });
      } else if (typeof optionValue === 'string') {
        if (optionValue in scores) {
          scores[optionValue]++;
        }
      }
    }
  });

  const dim1 = scores.E >= scores.I ? 'E' : 'I';
  const dim2 = scores.N >= scores.S ? 'N' : 'S';
  const dim3 = scores.T >= scores.F ? 'T' : 'F';
  const dim4 = scores.J >= scores.P ? 'J' : 'P';

  return `${dim1}${dim2}${dim3}${dim4}`;
};
