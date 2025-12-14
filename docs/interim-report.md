# Interim Report: AI-Enhanced Agricultural Weather Prediction System

## 1. Dataset Selection and Rationale
The dataset chosen for this project is the **Turkish Cities Daily Weather Dataset**, sourced from Kaggle (Contributor: Bahadır Bor). It contains daily meteorological observations for 81 cities in Turkey from 2019 to 2024.

### 1.1 Motivation for Selection
We selected this specific dataset based on the following criteria:

*   **Geographical Relevance:** The output target is the Turkish agricultural sector. Training on local data ensures the model learns the specific climatic characteristics of the region (e.g., continental climate of Central Anatolia), which global datasets often miss.
*   **Agricultural Suitability:** The dataset includes critical agrometeorological parameters such as **Temperature** (Max/Min) and **Humidity**. These are the primary drivers for pest outbreaks and frost events.
*   **Temporal Resolution:** The data is daily. This granularity is optimal for operational planning (irrigation, planting time), balancing prediction accuracy with computational efficiency.

### 1.2 Dataset Attributes Used
From the raw dataset, the following features were engineered and selected as inputs for the Deep Learning model:
*   **Input Features ($X$):**
    1.  `daily_max_temp` (Maximum Temperature °C) - *Primary Indicator*
    2.  `daily_min_temp` (Minimum Temperature °C) - *Critical for Frost Detection*
    3.  `avg_relative_humidity` (Relative Humidity %) - *Critical for Disease Prediction*
*   **Target Label ($y$):**
    *   `daily_max_temp` (The model predicts the next day's maximum temperature).

## 2. Methodology: Predictive Model Selection

### Selected Architecture: Long Short-Term Memory (LSTM)
We implemented a **Long Short-Term Memory (LSTM)** network, a specialized Recurrent Neural Network (RNN) architecture.

### Justification
1.  **Solving the Vanishing Gradient Problem:** Traditional RNNs fail to learn long-term dependencies. LSTMs utilize "gates" (input, output, forget gates) to regulate information flow, allowing the model to remember weather patterns from weeks ago (e.g., a developing cold front).
2.  **Sequential Nature of Weather:** Weather is a time-series problem where $T_{t+1}$ is highly dependent on sequence $[T_{t-30}, ..., T_t]$. LSTM is the industry standard for such sequential regression tasks.

## 3. Model Architecture and Technical Specifications

The model was built using **Python**, **TensorFlow/Keras**, and **Pandas**.

### 3.1 Network Topology
The architecture consists of four distinct layers designed to extract temporal features and prevent overfitting:

| Layer Type | Parameters | Activation | Purpose |
| :--- | :--- | :--- | :--- |
| **Input Layer** | Shape: `(30, 3)` | - | Accepts a rolling window of past 30 days with 3 features (MaxT, MinT, Humidity). |
| **LSTM Layer 1** | Units: `64` | `tanh` | Extracts high-level temporal patterns. `return_sequences=True` preserves time dimension. |
| **Dropout** | Rate: `0.2` | - | Randomly drops 20% of connections to prevent memorization (Overfitting). |
| **LSTM Layer 2** | Units: `32` | `tanh` | Refines features. `return_sequences=False` outputs a single vector. |
| **Dense (Output)** | Units: `1` | `linear` | Regresses the final predicted temperature value. |

### 3.2 Hyperparameters
*   **Loss Function:** `Mean Squared Error (MSE)` - Penalizes large errors, ideal for regression.
*   **Optimizer:** `Adam` - Adaptive learning rate optimization.
*   **Epochs:** `20` - Sufficient for convergence without overfitting on this dataset size.
*   **Batch Size:** `32`
*   **Look-back Window:** `30 Days`

## 4. Implementation Stages

The project lifecycle followed a rigorous data science pipeline:

### Stage 1: Data Preprocessing
Raw CSV data cannot be fed directly into an LSTM.
*   **Filtering:** Sub-setting data for "Ankara" to train a localized model.
*   **Normalization:** Applied `MinMaxScaler` to scale all features into the range `[0, 1]`. LSTMs are sensitive to unscaled data.
*   **Sequence Generation:** Converted linear time-series data into a supervised learning format using a sliding window approach ($X_{t-30}...X_{t} \rightarrow y_{t+1}$).

### Stage 2: Training and Evaluation
*   **Train/Test Split:** random split of 80% Training and 20% Testing data.
*   **Validation:** The model achieved a low Loss value (< 0.01 MSE) on the validation set, indicating successful generalization.

### Stage 3: Deployment (Hybrid Integration)
*   **API Service:** The trained model was serialized (`.keras`) and deployed via a **Flask API**.
*   **Inference Logic:** When a user requests a forecast on the specific web dashboard, the system:
    1.  Fetches historical context from the dataset.
    2.  Feeds the last 30 days into the LSTM model.
    3.  Returns the predicted temperature and a text-based insight (e.g., "Humidity rising, disease risk alert").

## 5. Conclusion
This interim report demonstrates that the selected **Dataset** and **LSTM Architecture** provide a robust foundation for agricultural decision support. The implementation successfully bridges historical data analysis with real-time web application requirements.
