/**
 * Prepare the payload for a selective update request.
 *
 * Let's say we have a recorded document with
 * ```
 * { _id: someId, farmerData: { units: 10, race: 'homo erectus' }}
 * ```
 * If you do this:
 * ```
 * someModel.findByIdAndUpdate(someId, { farmerData: { units: 25 } });
 * ```
 * Or this:
 * ```
 * someModel.findByIdAndUpdate(someId, { $set: { farmerData: { units: 25 } } });
 * ```
 * It will override previous farmerData (acts like a true setter on farmerData). You will
 * end up with:
 * ```
 * { _id: someId, farmerData: { units: 25 }}
 * ```
 * To avoid that, you should declare the specific update key like this:
 * ```
 * someModel.findByIdAndUpdate(someId, { $set: { 'farmerData.units': 25 } });
 * ```
 * This function creates such a payload for you, with as many keys as you want for the nested object:
 * ```
 * someModel.findByIdAndUpdate(someId, prepareUpdate('farmerData', { units: 25 }));
 * ```
 * It will keep previous farmeData and only update the units value. You will end up with:
 * ```
 * { _id: someId, farmerData: { units: 25, race: 'homo erectus' }}
 * ```
 */
export function prepareUpdate(parentKey: string, childObject: Record<string, any>) {
  const r: Record<string, any> = {};
  Object.keys(childObject).forEach(k => (r[parentKey + '.' + k] = childObject[k]));
  return { $set: r };
}
