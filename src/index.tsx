type Task<T> = { run: () => Promise<T> };

export default class TaskRunner<T = any> {
	private tasks: Task<T>[] = [];

	public addTask = (callback: () => Promise<T>) => {
		this.tasks.push({ run: callback });
	};

	public getTaskCount = () => this.tasks.length;

	public runAll = async ({
		onSuccess,
		onError
	}: {
		onSuccess?: (result: T, index: number) => void;
		onError?: (error: any, index: number) => void;
	} = {}): Promise<{ successes: T[]; errors: { error: any; task: Task<T> }[] }> => {
		const settled = await Promise.allSettled(this.tasks.map(t => t.run()));

		const successes: T[] = [];
		const errors: { error: any; task: Task<T> }[] = [];

		settled.forEach((res, index) => {
			if (res.status === "fulfilled") {
				successes.push(res.value);
				onSuccess?.(res.value, index);
			} else {
				errors.push({ error: res.reason, task: this.tasks[index] });
				onError?.(res.reason, index);
			}
		});

		return { successes, errors };
	};

	public clearTask = () => {
		this.tasks = [];
	};
}