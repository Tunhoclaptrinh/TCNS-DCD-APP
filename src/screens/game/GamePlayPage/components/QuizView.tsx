import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "@/src/styles/colors";

interface QuizOption {
    text: string;
    explanation?: string;
    isCorrect?: boolean; // Hidden ideally
}

interface QuizViewProps {
    data: any;
    onSubmit: (answerId: string) => Promise<any>;
    onNext: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ data, onSubmit, onNext }) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [result, setResult] = useState<{ isCorrect: boolean; explanation?: string; correctAnswer?: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleOptionPress = async (optionText: string) => {
        if (result || submitting) return; // Prevent multiple submissions
        
        setSelectedOption(optionText);
        setSubmitting(true);
        
        try {
            const res = await onSubmit(optionText); // Expecting full response object
            // res.data contains { isCorrect, explanation, correctAnswer }
            // or if the parent wrapper just returns the data part. Let's assume parent returns data.
            setResult(res.data || res); 
        } catch (error) {
            console.error("Quiz submission error", error);
        } finally {
            setSubmitting(false);
        }
    };

    const getOptionStyle = (optionText: string) => {
        if (!result) {
            return selectedOption === optionText ? styles.optionSelected : styles.optionNormal;
        }
        
        // Result phase
        if (optionText === selectedOption) {
            return result.isCorrect ? styles.optionCorrect : styles.optionWrong;
        }
        
        if (result.correctAnswer === optionText) {
            return styles.optionCorrect; // Highlight correct answer if user was wrong
        }

        return styles.optionDisabled;
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.questionCard}>
                <View style={styles.iconContainer}>
                     <Ionicons name="help-circle" size={40} color={COLORS.PRIMARY} />
                </View>
                <Text style={styles.questionText}>{data.question}</Text>
            </View>

            <View style={styles.optionsContainer}>
                {data.options?.map((opt: QuizOption, index: number) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.optionButton, getOptionStyle(opt.text)]}
                        onPress={() => handleOptionPress(opt.text)}
                        activeOpacity={0.9}
                        disabled={!!result || submitting}
                    >
                        <Text style={[
                            styles.optionText,
                            (result && (opt.text === selectedOption || opt.text === result.correctAnswer)) && styles.optionTextWhite
                        ]}>
                            {opt.text}
                        </Text>
                        
                        {/* Status Icon */}
                        {result && opt.text === selectedOption && (
                            <Ionicons 
                                name={result.isCorrect ? "checkmark-circle" : "close-circle"} 
                                size={24} 
                                color="white" 
                            />
                        )}
                    </TouchableOpacity>
                ))}
            </View>
            
            {result && (
                <View style={[styles.feedbackContainer, result.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                    <Text style={styles.feedbackTitle}>
                        {result.isCorrect ? "Correct!" : "Oops!"}
                    </Text>
                    {result.explanation && (
                         <Text style={styles.feedbackText}>{result.explanation}</Text>
                    )}
                    
                    <TouchableOpacity style={styles.nextButton} onPress={onNext}>
                        <Text style={styles.nextButtonText}>Continue</Text>
                        <Ionicons name="arrow-forward" size={20} color={COLORS.PRIMARY} />
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    questionCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.DARK,
        textAlign: 'center',
        lineHeight: 26
    },
    optionsContainer: {
        gap: 12
    },
    optionButton: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    optionNormal: {
        backgroundColor: 'white',
    },
    optionSelected: {
        borderColor: COLORS.PRIMARY,
        backgroundColor: '#F0F9FF',
    },
    optionCorrect: {
        backgroundColor: COLORS.SUCCESS,
        borderColor: COLORS.SUCCESS,
    },
    optionWrong: {
        backgroundColor: COLORS.ERROR,
        borderColor: COLORS.ERROR,
    },
    optionDisabled: {
        opacity: 0.6
    },
    optionText: {
        fontSize: 16,
        color: COLORS.DARK,
        flex: 1,
        fontWeight: '500'
    },
    optionTextWhite: {
        color: 'white',
        fontWeight: 'bold'
    },
    feedbackContainer: {
        marginTop: 24,
        padding: 20,
        borderRadius: 16,
        alignItems: 'center'
    },
    feedbackCorrect: {
        backgroundColor: '#F0FFF4',
        borderWidth: 1,
        borderColor: '#C6F6D5'
    },
    feedbackWrong: {
        backgroundColor: '#FFF5F5',
        borderWidth: 1,
        borderColor: '#FED7D7'
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: COLORS.DARK
    },
    feedbackText: {
        fontSize: 14,
        color: COLORS.GRAY,
        textAlign: 'center',
        marginBottom: 16
    },
    nextButton: {
        backgroundColor: 'white',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    nextButtonText: {
        color: COLORS.PRIMARY,
        fontWeight: 'bold',
        fontSize: 16
    }
});

export default QuizView;
