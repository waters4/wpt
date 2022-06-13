'use strict';

promise_test(async t => {
  const update1_promise = new Promise((resolve, reject) => {
    const observer = new ComputePressureObserver(
        resolve, {cpuUtilizationThresholds: [0.5], cpuSpeedThresholds: [0.5]});
    t.add_cleanup(() => observer.disconnect());
    observer.observe('cpu').catch(reject);
  });

  // iframe numbers are aligned with observer numbers. The first observer is in
  // the main frame, so there is no iframe1.
  const iframe2 = document.createElement('iframe');
  document.body.appendChild(iframe2);

  const update2_promise = new Promise((resolve, reject) => {
    const observer = new iframe2.contentWindow.ComputePressureObserver(
        resolve, {cpuUtilizationThresholds: [0.25], cpuSpeedThresholds: [0.75]});
    t.add_cleanup(() => observer.disconnect());
    observer.observe('cpu').catch(reject);
  });

  const iframe3 = document.createElement('iframe');
  document.body.appendChild(iframe3);

  const update3_promise = new Promise((resolve, reject) => {
    const observer = new iframe3.contentWindow.ComputePressureObserver(
        resolve, {cpuUtilizationThresholds: [0.75], cpuSpeedThresholds: [0.25]});
    t.add_cleanup(() => observer.disconnect());
    observer.observe('cpu').catch(reject);
  });

  const [update1, update2, update3] = await Promise.all([update1_promise, update2_promise, update3_promise]);
  assert_in_array(update1.cpuUtilization, [0.25, 0.75], 'cpuUtilization quantization');
  assert_in_array(update1.cpuSpeed, [0.25, 0.75], 'cpuSpeed quantization');
  assert_in_array(update2.cpuUtilization, [0.125, 0.625], 'cpuUtilization quantization');
  assert_in_array(update2.cpuSpeed, [0.375, 0.875], 'cpuSpeed quantization');
  assert_in_array(update3.cpuUtilization, [0.375, 0.875], 'cpuUtilization quantization');
  assert_in_array(update3.cpuSpeed, [0.125, 0.625], 'cpuSpeed quantization');
}, 'Three ComputePressureObserver instances in different iframes, but with ' +
  'the different quantization schemas, receive updates');
