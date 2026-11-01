import torch
import torch.nn as nn

class ANN(nn.Module):
    """
    Artificial Neural Network architecture as trained in research notebook.
    Input size: 7 features (N, P, K, temperature, humidity, ph, rainfall)
    Output size: 22 crop classes
    """
    def __init__(self, input_size: int = 7, num_classes: int = 22):
        super(ANN, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 128),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class DNN(nn.Module):
    """
    Deep Neural Network architecture with Batch Normalization as trained in notebook.
    Input size: 7 features
    Output size: 22 crop classes
    """
    def __init__(self, input_size: int = 7, num_classes: int = 22):
        super(DNN, self).__init__()
        self.network = nn.Sequential(
            nn.Linear(input_size, 256),
            nn.ReLU(),
            nn.BatchNorm1d(256),
            nn.Dropout(0.3),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.BatchNorm1d(128),
            nn.Dropout(0.3),
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.network(x)


class CNN1D(nn.Module):
    """
    1D-Convolutional Neural Network architecture as trained in notebook.
    Takes 1D feature vectors, applies Conv1d with adaptive average pooling and dense classifier.
    """
    def __init__(self, num_classes: int = 22):
        super(CNN1D, self).__init__()
        self.features = nn.Sequential(
            nn.Conv1d(
                in_channels=1,
                out_channels=32,
                kernel_size=3,
                padding=1
            ),
            nn.ReLU(),
            nn.Conv1d(
                in_channels=32,
                out_channels=64,
                kernel_size=3,
                padding=1
            ),
            nn.ReLU(),
            nn.AdaptiveAvgPool1d(1)
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, num_classes)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x shape: (batch_size, 7) -> (batch_size, 1, 7)
        x = x.unsqueeze(1)
        x = self.features(x)
        return self.classifier(x)

