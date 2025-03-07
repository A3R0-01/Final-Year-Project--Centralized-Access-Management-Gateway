from kafka import KafkaConsumer

def NewKafkaConsumer(topic: str, group_id : str, auto_offset_reset : str = 'earliest', enable_auto_commit : bool = True, *args, **kwargs) -> KafkaConsumer:
    consumer = KafkaConsumer(
        topic=topic,
        group_id=group_id,
        bootstrap_servers=['localhost:9092'],
        auto_offset_reset=auto_offset_reset,
        enable_auto_commit=enable_auto_commit
    )

    return consumer