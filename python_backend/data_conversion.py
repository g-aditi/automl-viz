import pandas as pd

df_classifiers = pd.read_csv("./python_backend/classifiers.csv")
df_hyperpartitions = pd.read_csv("./python_backend/hyperpartitions.csv")

method_map = dict(zip(df_hyperpartitions['id'], df_hyperpartitions['method']))

df_classifiers['method'] = df_classifiers['hyperpartition_id'].map(method_map)

df_classifiers.to_csv("./python_backend/classifiers_with_method.csv", index=False)