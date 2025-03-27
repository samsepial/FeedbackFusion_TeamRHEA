import os
from datasets import load_dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
import numpy as np
from evaluate import load as load_metric
import torch

# Check if CUDA is available and select the GPU if possible
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"Using device: {device}")

# Choose your model checkpoint: Option A or B
# For Option A:
base_model = "distilbert-base-uncased-finetuned-sst-2-english"
# For Option B (multilingual):
# base_model = "tabularisai/multilingual-sentiment-analysis"

# 1) Load your dataset (assuming a CSV file named "sentiment_data.csv")
# The CSV should have columns "text" and "label"
dataset = load_dataset("csv", data_files={"data": "/Users/abdul/feedbackfusion/backend/datafiles/sentiment_reviews.csv"})["data"]

# 2) Convert labels to numeric using a mapping
label2id = {"negative": 0, "positive": 1}
id2label = {v: k for k, v in label2id.items()}

def preprocess_labels(example):
    # Create a new field "labels" based on the "label" column
    example["labels"] = label2id[example["label"].strip().lower()]
    return example

dataset = dataset.map(preprocess_labels)

# 3) Split into training and validation sets (e.g., 80/20 split)
dataset = dataset.train_test_split(test_size=0.2, seed=42)
# The result is a DatasetDict with 'train' and 'test' splits.

# 4) Load tokenizer from the chosen model
tokenizer = AutoTokenizer.from_pretrained(base_model)

def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, padding="max_length", max_length=128)

# Tokenize the dataset (batched)
tokenized_datasets = dataset.map(tokenize_function, batched=True)
# No need to rename "labels" column if it's already created in step 2.
tokenized_datasets.set_format("torch", columns=["input_ids", "attention_mask", "labels"])

train_dataset = tokenized_datasets["train"]
val_dataset = tokenized_datasets["test"]

# 5) Load model and specify that there are 2 classes
model = AutoModelForSequenceClassification.from_pretrained(
    base_model,
    num_labels=2,
    label2id=label2id,
    id2label=id2label
)

# Move model to GPU if available
model.to(device)

# 6) Define training arguments
training_args = TrainingArguments(
    output_dir="./rhea_sentiment_finetuned",
    evaluation_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=32,
    per_device_eval_batch_size=32,
    num_train_epochs=2,
    weight_decay=0.01,
    logging_dir="./logs",
    logging_steps=1000,
    fp16=True
)


# 7) Define metrics (e.g., accuracy)
accuracy_metric = load_metric("accuracy")
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return accuracy_metric.compute(predictions=predictions, references=labels)

# 8) Initialize Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer,
    compute_metrics=compute_metrics
)

# 9) Train the model
trainer.train()

# 10) Save the fine-tuned model
trainer.save_model("./rhea_sentiment_finetuned")