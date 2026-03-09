import torch
import torch.nn as nn

TAGS = [
    "O",
    "B-PATIENT", "I-PATIENT",
    "B-DATE",
    "B-MED", "I-MED",
    "B-DOSAGE",
    "B-DURATION", "I-DURATION"
]

tag2idx = {t: i for i, t in enumerate(TAGS)}
idx2tag = {i: t for t, i in tag2idx.items()}


class NERModel(nn.Module):
    def __init__(self, vocab_size, embed_dim=100, hidden=256):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden, bidirectional=True, batch_first=True)
        self.fc = nn.Linear(hidden * 2, len(TAGS))

    def forward(self, x):
        x = self.embedding(x)
        x, _ = self.lstm(x)
        return self.fc(x)
