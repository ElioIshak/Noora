import tensorflow as tf

@tf.keras.utils.register_keras_serializable()
class MultiLabelF1Score(tf.keras.metrics.Metric):
    def __init__(self, num_labels=None, name='f1_score_macro', threshold=0.5, **kwargs):
        super().__init__(name=name, **kwargs)
        self.threshold = threshold
        self.num_labels = num_labels if num_labels is not None else 28  # default fallback

        self.tp = self.add_weight(name='tp', shape=(self.num_labels,), initializer='zeros')
        self.fp = self.add_weight(name='fp', shape=(self.num_labels,), initializer='zeros')
        self.fn = self.add_weight(name='fn', shape=(self.num_labels,), initializer='zeros')

    def update_state(self, y_true, y_pred, sample_weight=None):
        y_pred = tf.cast(y_pred > self.threshold, tf.float32)
        y_true = tf.cast(y_true, tf.float32)

        tp = tf.reduce_sum(y_true * y_pred, axis=0)
        fp = tf.reduce_sum((1 - y_true) * y_pred, axis=0)
        fn = tf.reduce_sum(y_true * (1 - y_pred), axis=0)

        self.tp.assign_add(tp)
        self.fp.assign_add(fp)
        self.fn.assign_add(fn)

    def result(self):
        precision = self.tp / (self.tp + self.fp + tf.keras.backend.epsilon())
        recall = self.tp / (self.tp + self.fn + tf.keras.backend.epsilon())
        f1 = 2 * precision * recall / (precision + recall + tf.keras.backend.epsilon())
        return tf.reduce_mean(f1)

    def reset_states(self):
        self.tp.assign(tf.zeros_like(self.tp))
        self.fp.assign(tf.zeros_like(self.fp))
        self.fn.assign(tf.zeros_like(self.fn))

    def get_config(self):
        config = super().get_config()
        config.update({
            'num_labels': self.num_labels,
            'threshold': self.threshold
        })
        return config

    @classmethod
    def from_config(cls, config):
        return cls(**config)
